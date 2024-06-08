import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import "./Chat.css";
import searchButton from "../../../assets/search-button.png";
import Toast from "../../../components/Toast/Toast";
import ConfirmationModal from "./ChatConfirmationModal";
import deliveryImg from "../../../assets/delivery2.png";
import deleteImg from "../../../assets/trash.png";
import toggleImg from "../../../assets/menu.png";
import createChatImg from "../../../assets/xbutton.png";

const ChatComponent = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();
  const [originalChatRooms, setOriginalChatRooms] = useState([]);
  const [username, setUsername] = useState("");
  const [userChatRooms, setUserChatRooms] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [filteredChatRooms, setFilteredChatRooms] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    // 서버에서 세션 정보를 가져와서 username을 설정합니다.
    const fetchSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/session", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          setUsername(data.user.username);
          fetchChatRooms();
          fetchUserChatRooms(data.user.username);
        }
      } catch (error) {
        console.error("세션에 오류가 발생했습니다.", error);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 채팅방 목록을 originalChatRooms에 설정
    setOriginalChatRooms(chatRooms);
  }, [chatRooms]);

  const fetchChatRooms = () => {
    // 서버에서 채팅방 목록 가져오는 요청
    axios
      .get("http://localhost:5000/api/getChatRoom")
      .then((response) => {
        setChatRooms(response.data.chatRooms);
        console.log("Username:", username); // setUsername 이후에 호출되도록 변경되었습니다.
      })
      .catch((error) => {
        console.error("채팅방을 가져오는데 실패했습니다.", error);
      });
  };

  const fetchUserChatRooms = (username) => {
    axios
      .get(`http://localhost:5000/api/getUserChatRoom?userId=${username}`)
      .then((response) => {
        const responseData = response.data;
        console.log("서버 응답 확인:", responseData); // 서버 응답 확인
        if (responseData.success) {
          const userRooms = responseData.userChatRooms;
          // 서버 응답의 형식에 따라서 userRooms를 수정할 수 있습니다.
          // 예를 들어, 서버에서 userChatRooms가 배열이 아닌 객체로 온다면 배열로 변환할 수 있습니다.
          const modifiedUserRooms = Array.isArray(userRooms) ? userRooms : [];
          setUserChatRooms(modifiedUserRooms);
          console.log(
            "사용자가 참여한 채팅방을 가져왔습니다.",
            modifiedUserRooms
          );
        } else {
          console.error("서버 응답에 실패했습니다:", responseData.message);
        }
      })
      .catch((error) => {
        console.error(
          "사용자가 참여한 채팅방을 가져오는데 실패했습니다.",
          error
        );
      });
  };

  const handleCreateRoom = () => {
    navigate(`/room`);
  };

  const handleRoomClick = (roomId) => {
    navigate(`/chatRoom/${roomId}`);
  };

  const isAlreadyJoined = (roomId) => {
    return userChatRooms.some((room) => room.id === roomId);
  };

  const handleJoinRoom = (roomId) => {
    if (!username) {
      console.error("유저 ID를 찾을 수 없습니다! 로그인이 필요합니다.");
      // 로그인 페이지로 이동하도록 할 수 있습니다.
      navigate(`/login`);
      return;
    }

    if (!isAlreadyJoined(roomId)) {
      // 새로운 채팅방일 때만 서버에 요청하여 입장 처리
      axios
        .post("http://localhost:5000/api/joinChatRoom", {
          roomId,
          userId: username,
        })
        .then((response) => {
          navigate(`/chatRoom/${roomId}`);
        })
        .catch((error) => {
          console.error("채팅방에 입장하는데 실패했습니다.", error);
        });
    } else {
      // 이미 입장한 채팅방이라면 바로 이동
      navigate(`/chatRoom/${roomId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  // 검색 버튼 클릭 이벤트 핸들러
  const handleSearch = () => {
    if (searchKeyword.trim() !== "") {
      // 검색어가 입력된 경우에만 필터링
      const filtered = originalChatRooms.filter((room) =>
        room.room_name.includes(searchKeyword)
      );
      setFilteredChatRooms(filtered);

      if (filtered.length === 0) {
        // 검색 결과가 없는 경우 토스트 메시지 표시
        setShowToast(true);

        // 일정 시간 후에 토스트 메시지 숨기기
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        setShowToast(false);
      }
    } else {
      // 검색어가 입력되지 않은 경우 전체 채팅방을 보여줌
      setFilteredChatRooms([]);
      setShowToast(false);
    }
  };

  // 채팅방 삭제 함수
  const handleDeleteRoom = (roomId) => {
    setRoomToDelete(roomId);
    setShowConfirmationModal(true);
  };

  const confirmDeleteRoom = () => {
    setShowConfirmationModal(false);
    // 서버로 삭제 요청을 보내는 로직
    axios
      .delete(`http://localhost:5000/api/deleteChatRoom/${roomToDelete}`)
      .then((response) => {
        // 삭제 성공 시 화면에서 해당 방을 제거합니다.
        setChatRooms(chatRooms.filter((room) => room.id !== roomToDelete));
      })
      .catch((error) => {
        console.error("채팅방 삭제에 실패했습니다.", error);
      });
  };

  return (
    <div className="chat-component-container">
      <NavigationBar />
      <div className="left-container">
        <button className="make-chat-button" onClick={handleCreateRoom}>
          채팅방 만들기
        </button>

        <h1>내 채팅방</h1>
        <div className="myChatList">
          {userChatRooms.length > 0 ? (
            <ul>
              {userChatRooms.map((room) => (
                <li key={room.id} onClick={() => handleRoomClick(room.id)}>
                  {!room.description && (
                    <img
                      src={deliveryImg}
                      alt="Description available"
                      className="delivery-image"
                    />
                  )}
                  {room.room_name}
                </li>
              ))}
            </ul>
          ) : (
            <p>참여한 채팅방이 없습니다.</p>
          )}
        </div>
      </div>
      <div className="vertical-line"></div>
      <div className="right-container">
        <div className="chat-search-container">
          <div className="searchInput">
            <input
              type="text"
              placeholder="채팅방 이름을 검색하세요."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <img
            src={searchButton}
            className="searchButton"
            onClick={handleSearch}
            alt="Search"
          ></img>
        </div>
        {(searchKeyword.trim() === "" ? chatRooms : filteredChatRooms)
          .filter((room) => room.description) // description이 있는 방만 필터링
          .map((room) => (
            <div key={room.id} className="card">
              <div className="card-header">
                <h3>{room.room_name}</h3>
                {username === room.username && ( // 방 생성자와 로그인한 사용자가 같을 때만 삭제 버튼을 표시합니다.
                  <div className="delete-button-container">
                    <img
                      src={deleteImg}
                      alt="Description available"
                      className="delete-chat-button"
                      onClick={() => handleDeleteRoom(room.id)}
                    />
                  </div>
                )}
              </div>
              <p className="description">{room.description}</p>
              <p className="createdby">{room.username}</p>
              <div className="chat-low">
                <p className="createdat">
                  개설일 {formatDate(room.created_at)}
                </p>

                <div className="join-button-container">
                  <button
                    className="joinChatButton"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    채팅방 입장
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <Toast message="해당 검색 결과가 없습니다." showToast={showToast} />
      {showConfirmationModal && (
        <ConfirmationModal
          onCancel={() => setShowConfirmationModal(false)}
          onConfirm={confirmDeleteRoom}
        />
      )}
    </div>
  );
};

export default ChatComponent;
