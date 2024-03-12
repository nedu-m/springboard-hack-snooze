"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  await putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** submit add-story form whe click on submit */
async function navAddStoryClick(evt){
      let title = $("#story-title").val();
      let author = $("#story-author").val();
      let url = $("#story-url").val();

      $storiesLoadingMsg.show();
      await postStoryAndShow({title, author, url});
      $storiesLoadingMsg.hide();
      
      $("#story-title").val("");
      $("#story-author").val("");
      $("#story-url").val("");
}

$navAddStory.on('click', navAddStoryClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navAddStory.hide();
  $navLogOut.show();
  $navFavorites.show();
  $navUserStories.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// when click on favorites, show currentUser's favorites
function navFavoritesClick(evt){
  hidePageComponents();
  putFavoritesOnPage();
}
$navFavorites.on('click', navFavoritesClick);

// when click on my story, show currentUser's own stories and add story form
function navUserStoriesClick(evt){
  hidePageComponents();
  putUserStoriesOnPage();
}
$navUserStories.on("click", navUserStoriesClick);
