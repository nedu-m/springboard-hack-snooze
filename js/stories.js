"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let storyIdList_delete = [];
let favorClickLog = {};


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  hidePageComponents();
  $storiesLoadingMsg.show();
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  let status = isStoryInFavorites(story)? "story-favorite":"story-unfavorite";

  let li = $(`
  <li >
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`);

  let btn = $(`<button id="${story.storyId}" class="story ${status}"><i class="fas fa-heart"></i></button>`);
  btn.on('click', storyBtnClick);
  li.prepend(btn);

  return li;
}

//all list without login
function generateStoryMarkup_nologin(story){
  const hostName = story.getHostName();
  let li = $(`
  <li >
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`);

  return li;
}

// favorite list
function generateStoryMarkup_favor(story){
  const hostName = story.getHostName();
  let status = isStoryInFavorites(story)? "story-favorite":"story-unfavorite";

  let li = $(`
  <li >
    <i class="far fa-star ${status}"></i></button>
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`);

  return li;
}


//own list
function generateStoryMarkup_own(story){
  const hostName = story.getHostName();
  let li = $(`
  <li >
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`);

  let btn = $(`<button id="delete-${story.storyId}" class="story story-delete"><i class="fas fa-trash-alt "></i></button>`);

  btn.on('click', storyDeleteClick);
  li.append(btn);

  return li;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  if(currentUser){
    $allStoriesList.empty();

      // loop through all of our stories and generate HTML for them
      for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
      }
      $allHead.show();
      $allStoriesList.show();
      updateNavOnLogin();
  }
  else{
    $nologinAllStoriesList.empty();
    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      const $story = generateStoryMarkup_nologin(story);
      $nologinAllStoriesList.append($story);
    }
    // $allHead.hide();
    // $userHead.hide();
    $nologinAllStoriesList.show();
  }
}
  
// put favorites on list
function putFavoritesOnPage() {

  console.debug("putFavoritesOnPage");

  $favoritesList.empty();

    // loop through user favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      // for (let story of storyList.stories) {
      const $story = generateStoryMarkup_favor(story);
      $favoritesList.append($story);
    }

    $favoritesList.show();
    updateNavOnLogin();
}

// put currentUser's own stories on list
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $userStoriesList.empty();

    // loop through user favorites and generate HTML for them
    for (let story of currentUser.ownStories) {
      // for (let story of storyList.stories) {
      const $story = generateStoryMarkup_own(story);
      $userStoriesList.append($story);
    }

    $navUserStories.hide();
    $addStoryForm.show();
    $userHead.show();
    $userStoriesList.show();
    $navAddStory.show();
}

/** post a new story and show it in story-list */
async function postStoryAndShow(newStory){
   let story = await storyList.addStory(currentUser, newStory);
   storyList.stories.unshift(story);
   if (story !== null){
     currentUser.ownStories.unshift(story);
     const $elementStory = generateStoryMarkup_own(story);
     $userStoriesList.prepend($elementStory);
   }

   $userStoriesList.show();
}


/** update favorites */
async function btnUpdateFavoriteClick(){
  let storyIds = Object.keys(favorClickLog);
  hidePageComponents();
  $storiesLoadingMsg.show();

  for(let id of storyIds){
    let {status,count} = favorClickLog[id];
    if(count%2 != 0){
      if (status === "story-favorite"){//need to unfavorite it
        await removeStoryFromFavorites(id); 
      }
      else{ // need to favorite it
        await addStoryToFavorites(id);
      }
    }
  }
  $storiesLoadingMsg.hide();
  $allHead.show();
  $allStoriesList.show();
  favorClickLog = {};
}

$btnUpdateFavorite.on("click", btnUpdateFavoriteClick);

/** update own stories */
async function btnUpdateUserClick(){
  $storiesLoadingMsg.show();
  for(let id of storyIdList_delete){
    await removeStoryFromStoryList(id);
  }
  $storiesLoadingMsg.hide();

  storyList.stories = removeStoriesFrom_storyArr(storyList.stories, storyIdList_delete);

  currentUser.ownStories = removeStoriesFrom_storyArr(currentUser.ownStories, storyIdList_delete);
  
  currentUser.favorites = removeStoriesFrom_storyArr(currentUser.favorites, storyIdList_delete);
  
  storyIdList_delete = [];
}

$btnUpdateUser.on("click", btnUpdateUserClick);

/**
 * handle click on favorite button 
 */
function storyBtnClick(evt){
  let storyId = $(this).attr("id");
  let story = findStoryByStoryId(storyId);

  if (story === undefined) return;

  if (!(storyId in favorClickLog)){ //first time click
    let status = isStoryInFavorites(story)? "story-favorite":"story-unfavorite";

    let obj ={ status,count:1};
    favorClickLog[storyId] = obj;
  }
  else{
    favorClickLog[storyId].count++;
  }

  if(this.classList.contains("story-favorite")){//change to unfavorite
      this.innerHTML = '<i class="far fa-heart"></i>';
      this.classList.replace('story-favorite', 'story-unfavorite');
  }
  else{ //change to favorite
    this.innerHTML = '<i class="fas fa-heart"></i>';
    this.classList.replace('story-unfavorite', 'story-favorite');
  }
  
}

// handle delete story
function storyDeleteClick(evt){
  let storyId = $(this).attr("id").substring(7);
  console.log(storyId);
  storyIdList_delete.push(storyId);
  this.parentNode.remove();
}

/** Helper functions */
// isStoryInFavorites
function isStoryInFavorites(story){
  return currentUser.favorites.some((e)=>e.storyId === story.storyId);
}

// findStoryByStoryId
function findStoryByStoryId(storyId){
  return storyList.stories.find(e => e.storyId === storyId);
}

//removeStoriesFrom_storyList
function removeStoriesFrom_storyArr(storyArr, storyIds){
  let id_set = new Set(storyIds);
  let filterredStories = storyArr.filter(e=>{
    return !(id_set.has(e.storyId));
  });

  return filterredStories;
}