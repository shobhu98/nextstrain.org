import React from "react";
import styled from "styled-components";
import FaAngleDown from "react-icons/lib/fa/angle-down";
import FaAngleUp from "react-icons/lib/fa/angle-up";

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #CCC;
  margin: 0px;
  padding: 15px 10px 10px 10px;
`;
const IconContainer = styled.span`
  font-size: 22px;
  font-weight: 500;
`;
const Name = styled.span`
  font-size: 20px;
  font-weight: 500;
`;
const CollapseTitle = ({name, isExpanded=false}) => (
  <TitleContainer>
    <Name>{name}</Name>
    <IconContainer>{isExpanded ? <FaAngleUp /> : <FaAngleDown />}</IconContainer>
  </TitleContainer>
);

export default CollapseTitle;