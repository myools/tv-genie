// declare variables
// tracking if show results are displayed
var resultsExist = false;
// tracking if show has been selected
var selection = false;
// copy of Json reponse object
// copy used for accessing certain Json object information outside of fetch scope
var jsonObj;
// arry to store previous search results
var previousResults = new Array();
// visibility status of back button
var backButtonVisible = false;

// functions
// fetches Json object using tvmaze.com api
// renders shows by passing Json object to renderShows function
function searchShow(showQuery){
  fetch(`https://api.tvmaze.com/search/shows?q=${showQuery}`)
  .then(response => {
    if (response.ok){
        return response.json();
      }
      throw new Error(response.statusText);
  })
  .then(responseJson => displayShows(responseJson))
  .catch(err => alert(`Something went wrong: ${err.message}`));
}

// tracks if form has been submitted
function watchForm(){
  $('form').submit(event => {
    event.preventDefault();
    // remove previous search results if any
    removeSelectedShow();
    removePreviousResults();
    if (backButtonVisible === true){
      $('.back-button').remove();
    }
    // get value of submitted text
    let showQuery = $('#show-search').val();
    console.log(showQuery);
    // use value to search for show
    searchShow(showQuery);
    previousResults = [];
  })

}

// handles show selection when show image is clicked
function handleShowSelection(){
  $('.results').on('keypress click', '.show-image', function(event){
    if (event.which === 13 || event.type === 'click' || event.which === 32){
    event.preventDefault();
    if(selection === false){

    // set shows index in array using id stored in img
    let showIndex = $(this).attr('id');
    // stores shows airtime days
    let showDays = jsonObj[showIndex].show.schedule.days.join();
    // stores show time
    let showTime = jsonObj[showIndex].show.schedule.time;
    // stores show summary
    let showSummary = jsonObj[showIndex].show.summary;
    // stores shows associated network
    let networkObj = jsonObj[showIndex].show.network;
    // stores final value of shows network
    let network;
    // stores shows local timezone
    let showTimeZone;

    // render back arrow button when show is selected
    $('.button').after(`<input class="back-button" type="button" value=" ">`)

    // store status of back button visibility var to true
    backButtonVisible = true;

    // checks if shows network has a value
    if(networkObj === null || networkObj === "" || networkObj === undefined){
      // if shows network/timezone is empty store var with unavailable string
      network = "<p>Network unavailable</p>";
      showTimeZone = "<p>Timezone unavailable</p>";
    }
    // if executed show timezone and network is available
    // assign values to variables to be displayed
    else{
    showTimeZone = jsonObj[showIndex].show.network.country.timezone;
    network = jsonObj[showIndex].show.network.name;
    }

    // checks show days, time, summary, and timezone to see if empty
    //  if empty give variables unavailable string
    if(showDays === null || showDays === "" || showDays === undefined){
      showDays = "days unavailable";
    }
     if(showTime === null || showTime === "" || showTime === undefined){
      showTime = "time unavailable";
    }
    if(showSummary === null || showSummary === "" || showSummary === undefined){
      showSummary = "<p>Summary unavailable</p>";
    }
    if(showTimeZone === null || showTimeZone === "" || showTimeZone === undefined){
      showTimeZone = "<p>Timezone unavailable</p>";
    }
    
    // stores final https url of image
    let httpsUrl;
    // stores original url of immage
    let imgUrl;

    let imgAvailable;


    // remove previous show results
    removePreviousResults();

    // if no show image is available set its url to default image and render show
    if(jsonObj[showIndex].show.image == null){
      httpsUrl = "assets/image-not-found.png";

      imgAvailable = false;

    // renders selected show
     renderSelectedShow(showIndex, httpsUrl, jsonObj, showDays, showTime, showTimeZone, network, showSummary, imgAvailable);
    }
    else{
      // if show image is available set its url to default image and render show
      imgUrl = jsonObj[showIndex].show.image.medium;
      // convert default image url to https from http
      httpsUrl = imgUrl.replace("http", "https");

      imgAvailable = true;
     // renders selected show
     renderSelectedShow(showIndex, httpsUrl, jsonObj, showDays, showTime, showTimeZone, network, showSummary, imgAvailable);
    }
     
     // scroll to top of screen when show is selected for better user experience
     scrollToTop();
     // set show selection variable to true since a show has been selected
     selection = true;
    }
  }
  })
}

// renders show results when submitted
function displayShows(responseJson){
  console.log(responseJson);

  // check how many results were returned
  // if none are returned display alert
  checkNumberOfResults(responseJson);

  // copy fetched responseJson obj into variable
  jsonObj = responseJson;
  // use for loop to loop through each result found
  for(let i = 0; i < responseJson.length; i++){

   // store img url
   let imgUrl;
   // store https img url
   let httpsUrl;
   // store img html
   let imgHtml;

   // if no image for show set url to default unavailable img
   if (responseJson[i].show.image == null){
    httpsUrl = "assets/image-not-found.png";

    // stores character length of show name string
    let showNameLength = responseJson[i].show.name.length;
    // stores div class name
    let dClassName;

    // change dClassName based off length of show name
    // longer show names get different div class name in order to style properly
    if (showNameLength > 20){
      dClassName = 'no-img-show-wrapper-push';
    }
    else{
      dClassName = 'no-img-show-wrapper';
    }

    // renders show in display results if no image available
    $('.results-wrapper').append(`<div class="${dClassName}"><img class="show-image"  role="button" tabindex="0" id="${i}" src="${httpsUrl}"alt="${responseJson[i].show.name}"/><p class="show-name-results">${responseJson[i].show.name}</p>
    </div>`)

    // store html for rendered show that has no img
    imgHtml = `<div class="${dClassName}">` + $(`#${i}`)[0].outerHTML + `<p class="show-name-results">${responseJson[i].show.name}</p>` + `</div>`;

   }
   else{
    // set to shows img url
    imgUrl = responseJson[i].show.image.medium;
    // convert shows img url to https url
    httpsUrl = imgUrl;

    // renders show in display results when image available
    $('.results-wrapper').append(`<div class="show-wrapper"><img class="show-image"  role="button" tabindex="0" id="${i}" src="${httpsUrl}"alt="${responseJson[i].show.name}"/>
    </div>`)

    // store html for rendered show that has img
    imgHtml = `<div class="show-wrapper">` + $(`#${i}`)[0].outerHTML + `</div>`;
   }
    
    // store all results html into array to be used later for rendering
    previousResults.push(imgHtml);
  }

  // since results have been rendered make status true
  resultsExist = true;
}

// checks value of show schedule
function checkSchedule(showDaysTime){
  if(showDaysTime === null || showDaysTime === "" || showDaysTime === undefined){
      showDaysTime = "Unavailable";
    }
}

// removes previous search results
function removePreviousResults(){
  if(resultsExist === true || selection === true){
    $('.results-wrapper').empty();
    selection = false;
  }
  resultsExist = false;
}

// returns previous search results when back button is pressed
function watchResultsButton(){
  $('header').on('click', '.back-button', function(event){
    
    event.preventDefault();
    $('.results-wrapper').empty();
    removeSelectedShow();
    let backResults = previousResults.join("");
    $('.results-wrapper').append(backResults);

    selection = false;
    resultsExist = true;

    $('.back-button').remove();
  })
}

// removes show wrapper
function removeSelectedShow(){
  $('.selected-show-wrapper').remove();
}

// scrolls to top of screen when show is selected
function scrollToTop(){ 
  window.scrollTo(0, 0);
 } 

// checks if any shows are found
function checkNumberOfResults(responseJson){
 if (responseJson.length === 0){
    alert('No shows found try again');
  }
}


// function used to render show selection
function renderSelectedShow(showIndex, httpsUrl, jsonObj, showDays, showTime, showTimeZone, network, showSummary, imgAvailable){
let showName;

if (imgAvailable === false){
  showName = jsonObj[showIndex].show.name;
 
}
else {
  showName = "";
}
 $('.results').append(`
     <div class="selected-show-wrapper">
     <img class="selected-show-image" id="${showIndex}" src="${httpsUrl}"alt="${jsonObj[showIndex].show.name}"/>
     <p class="selected-show-name">${showName}</p>
     <div class="show-info">
     <h1 class="show-name">${jsonObj[showIndex].show.name}</h1>
     <p class="show-details">Schedule</p>
     <p>${showDays} - ${showTime}</p>
     <p class="show-details">Timezone</p>
     <p>${showTimeZone}</p>
     <p class="show-details">Network</p>
     <p>${network}</p>
     <p class="show-details">Summary</p> 
     ${showSummary}
     </div>
     </div>
     `)
}

// function used for app initialization
function handleApp(){
  $(watchForm());
  $(handleShowSelection());
  $(watchResultsButton());
}

// makes app ready
$(handleApp())
