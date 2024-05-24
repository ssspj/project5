import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const activeStyle = {
    color: "darkseagreen",
    fontWeight: 700,
    textDecoration: "none", // 밑줄 제거
  };

  const defaultStyle = {
    color: "black", // 활성화되기 전에는 검정색
    fontWeight: 700,
    textDecoration: "none", // 밑줄 제거
  };

  return (
    <div className="sidebar">
      <div style={{ marginTop: "150px", textAlign: "left" }}>
        <div className="Pgname" style={{ marginBottom: "60px" }}>
          마이페이지
        </div>
        <ul>
          <li>
            <NavLink
              style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              to="/mypage"
            >
              내 정보
            </NavLink>
          </li>
          <li>
            <NavLink
              style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              to="/mypagechangepw"
            >
              비밀번호 변경하기
            </NavLink>
          </li>
          <li>
            <NavLink
              style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              to="/mypageposts"
            >
              내가 쓴 글
            </NavLink>
          </li>
          <li>
            <NavLink
              style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              to="/mypagelikes"
            >
              좋아요 누른 글
            </NavLink>
          </li>
          <li>
            <NavLink
              style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              to="/mypagewithdraw"
            >
              회원 탈퇴
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
