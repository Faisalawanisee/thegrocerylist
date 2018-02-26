import React, { Component } from "react";
import styled from "styled-components";
import { Row, Col, Button } from "antd";
import { connect } from "react-redux";
import { setPrimary, connectAccount } from "../../actions";
import UnlinkModal from "./UnlinkModal";

const dietTypes = [
  "lactovegetarian",
  "ovovegetarian",
  "paleo",
  "primal",
  "pescetarian",
  "vegan",
  "vegetarian",
  "ketogenic",
  "whole30"
];

const FontAwesome = require("react-fontawesome");

class UserAccounts extends Component {
  render() {
    return (
      <DietContainer xs={{ span: 22, offset: 1 }}>
        <p>holder</p>
      </DietContainer>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps, { setPrimary, connectAccount })(UserAccounts);

const DietContainer = styled(Col)`
  background: rgba(255, 255, 255, 0.9);
  height: 600px;
  border-radius: 4px;
  margin: 0 auto;
`;
