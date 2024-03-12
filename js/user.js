"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();

  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents();
  putStoriesOnPage(); 

  updateNavOnLogin();
}

/** add a story to favorite of currentUser 
 * if success, update currentUser.favorites, and return 0; otherwise return -1
*/
//hsap
async function addStoryToFavorites(storyId){
  try{
    let url = `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`;
    let data = {token:currentUser.loginToken};
    let res = await axios({
      url,
      method:"POST",
      data,
    })
    currentUser.favorites = res.data.user.favorites.map(e=>new Story(e));
    console.log(currentUser.favorites);
    return 0;// success
  }
  catch(err){
    console.log("Error in adding a story to favoriate", err);
    return -1; //failure
  }
}

/** delete a story from favorites 
 * return 0 if success, -1 if failed
*/
async function removeStoryFromFavorites(storyId){
  try{
    let url = `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`;
    let data = {token:currentUser.loginToken};
    let res = await axios({
      url,
      method:"DELETE",
      data,
    })
    console.log(res);
    currentUser.favorites = res.data.user.favorites.map(e=>new Story(e));
    return 0;// success
  }
  catch(err){
    console.log("Error in adding a story to favoriate", err);
    return -1; //failure
  }
}

/** delete a story and update db 
 * return story deleted if success; null otherwise
 * note: can only delete story created by currentUser
*/
async function removeStoryFromStoryList(storyId){
  try{
    let url = `${BASE_URL}/stories/${storyId}`;
    let data = {token:currentUser.loginToken};
    let res = await axios({
      url,
      method:"DELETE",
      data,
    })
    console.log(res);
    return res.data.story; // success
  }
  catch(err){
    console.log("Error in adding a story to favoriate", err);
    return null; //failure
  }
}

