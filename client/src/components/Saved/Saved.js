import React, { Component } from "react";
import { connect } from "react-redux";
import { Dropdown, Icon, Row, Col, Button, Menu } from "antd";
import Spinner from "../Misc/Spinner";
import styled from "styled-components";
import NoResults from "../Misc/NoResults";
import SavedResults from "./SavedResults";
import NoCuisines from "../Misc/NoCuisines";
// import axios from "axios";

class Saved extends Component {
  // Local State will store recipe results
  state = {
    loading: false,
    data: [],
    cuisine: "",
    offset: 0,
    searched: false
  };

  // Render DropDown menu fields from user's Cuisines Prefs
  renderFields(auth) {
    return (
      auth &&
      Object.keys(auth.savedRecipes.cuisines)
        .filter(item => auth.savedRecipes.cuisines[item].length)
        .map(cuisine => {
          return (
            <Menu.Item key={cuisine.toUpperCase()}>
              <DropDownAnchor>{cuisine.toUpperCase()}</DropDownAnchor>
            </Menu.Item>
          );
        })
    );
  }

  // DropDown menu selection initializes Mongo Recipe Collection Query
  async getRecipes(auth, cuisineKey) {
    this.setState({ loading: true });
    // User's saved recipes for chosen cuisine
    let subDocCuisine = auth.savedRecipes.cuisines[cuisineKey];
    console.log("getRecipes subDocCuisine.length: ", subDocCuisine.length);
    console.log("auth in getRecipes: ", auth.savedRecipes.cuisines[cuisineKey]);

    // Based on offset, grab 10 recipe ids from User SavedRecipes subdoc
    let recipeIds = [];

    // Fill recipeIds with at most 10 records
    for (let i = this.state.offset; i < subDocCuisine.length; i++) {
      if (recipeIds.length < (subDocCuisine.length < 3 ? subDocCuisine.length : 3)) {
        console.log("recipe pushed: ", subDocCuisine[i]);
        console.log("index: ", i);
        recipeIds.push(subDocCuisine[i]);
      } else break;
    }

    console.log("before setting state recipeIds:", recipeIds);
    this.setState(
      {
        data: recipeIds,
        cuisine: cuisineKey,
        loading: false
      },
      () => console.log("state in getRecipes: ", this.state)
    );
  }

  removeSavedRecipe(recipeId) {
    console.log("saved.js removing recipe: ", recipeId);
    let newData = this.state.data.filter(recipe => recipe.id !== recipeId);
    this.setState(
      {
        data: newData
      },
      () => {
        console.log("updated Saved.js state after deleting recipe", this.state);
        if (!this.state.data.length) {
          console.log("this.state.data.length is zero: ", this.state.data.length);
          // If all 10 recipes deleted, start from beginning
          this.setState({ offset: 0 });
          this.getRecipes(this.props.auth, this.state.cuisine);
        }
      }
    );
  }

  // Paging Buttons, call API query with page offset parameters
  nextPage(direction) {
    this.setState(
      {
        data: [],
        offset: direction === "Prev" ? this.state.offset - 3 : this.state.offset + 3
      },
      () => {
        console.log("direction after pagination click: ", direction);
        console.log("state.offset after pagination click: ", this.state.offset);
        console.log("state.data after pagination click: ", this.state.data);
        this.getRecipes(this.props.auth, this.state.cuisine, direction);
      }
    );
  }

  render() {
    let { auth } = this.props;
    let { data, loading, offset, searched, cuisine } = this.state;

    const menu = (
      <Menu
        onClick={({ key }) => {
          this.setState({ cuisine: key, data: [], searched: true });
          console.log("calling getRecipes menu click");
          this.getRecipes(auth, key.toLowerCase());
        }}
      >
        {/* Call fn To Render Drop-Down Menu Items */}
        {this.renderFields(auth)}
      </Menu>
    );

    return (
      // Auth loaded but user HAS NOT set any Cuisines in Prefs, render reminder
      auth && Object.keys(auth.preferences.cuisines).every(i => !auth.preferences.cuisines[i]) ? (
        <NoCuisines />
      ) : // Auth loaded && user HAS set Cuisines in Prefs, render DropDown Menu
      auth ? (
        <div className="savedRecipesComponent">
          <Row className="DropDownRow">
            <Column
              xs={{
                span: 20,
                offset: 2
              }}
            >
              <Dropdown overlay={menu} trigger={["click"]} ref="dropdown">
                <Anchor className="ant-dropdown-link" href="">
                  SELECT A CUISINE
                  <Icon type="down-circle" />
                </Anchor>
              </Dropdown>
            </Column>
          </Row>
          {/* Placeholder Bar to match Bar on SearchResults component */}
          {!data.length && <Header>•SAVED•</Header>}
          {/*  If no savedRecipes on User Model, display NoResults component */}
          {Object.keys(auth.savedRecipes.cuisines).filter(item => auth.savedRecipes.cuisines[item].length).length ===
            0 && <NoResults header={"YOU HAVEN'T SAVED ANY RECIPES"} text={"SEARCH FOR & SAVE SOME RECIPES"} />}
          {/*  User clicks option, show loading spinner until Axios request completes */}
          {loading ? (
            <SpinColumn
              xs={{
                span: 8,
                offset: 8
              }}
            >
              <Spinner />
            </SpinColumn>
          ) : // Only render SearchResults if state data has length
          data.length ? (
            <SavedResults
              data={data}
              cuisine={cuisine}
              removeSavedRecipe={recipeId => this.removeSavedRecipe(recipeId)}
            />
          ) : null}
          {!loading &&
            data[0] !== null &&
            data.length > 0 && (
              <PageButtonRow className="pageButtonDiv">
                <PageButtonCol
                  xs={{
                    span: 6,
                    offset: 4
                  }}
                  sm={{
                    span: 4,
                    offset: 8
                  }}
                >
                  {(data.length > 0 || searched) &&
                    offset > 0 && (
                      <Button id={"Prev"} onClick={e => this.nextPage(e.target.id)}>
                        Prev
                      </Button>
                    )}
                </PageButtonCol>

                <PageButtonCol
                  xs={{
                    span: 6,
                    offset: 4
                  }}
                  sm={{
                    span: 4,
                    offset: 0
                  }}
                >
                  {offset + 3 < auth.savedRecipes.cuisines[cuisine].length &&
                    searched && (
                      <Button id={"Next"} onClick={e => this.nextPage(e.target.id)}>
                        Next
                      </Button>
                    )}
                </PageButtonCol>
              </PageButtonRow>
            )}
        </div>
      ) : null
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps)(Saved);

const Header = styled.h1`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  letter-spacing: 0.8em;
  text-indent: 0.8em;
  background-color: rgba(255, 255, 255, 0.1);
  text-shadow: -1px -1px 1px rgba(255, 255, 255, 0.25), 1px 1px 1px rgba(1, 1, 1, 0.1);

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const Anchor = styled.a`
  color: rgba(108, 76, 76, 0.87) !important;
  font-size: 12px;
  cursor: default;
  letter-spacing: 0.13em;
  text-indent: 0.1em;
  padding: 5px 15px;
  border: 1px solid rgba(209, 205, 205, 0.15);
  border-radius: 20px;
  box-shadow: 3px 2px 9px rgba(1, 1, 1, 0.05);
  background-color: rgba(255, 255, 255, 0.2);
  &:hover {
    color: rgba(255, 255, 255, 0.8) !important;
  }
  &:active {
    box-shadow: inset 1px 1px 2px rgba(1, 1, 1, 0.1);
    background-color: rgba(1, 1, 1, 0.02);
  }
`;

const DropDownAnchor = styled.a`
  color: rgba(108, 76, 76, 0.87) !important;
`;

const Column = styled(Col)`
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const SpinColumn = styled(Col)`
  text-align: center;
  margin-top: 20%;
`;

const PageButtonRow = styled(Row)`
  clear: both;
  margin: 15px 0 40px 0;
`;

const PageButtonCol = styled(Col)`
  text-align: center;
`;
