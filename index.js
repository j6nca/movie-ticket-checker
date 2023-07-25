const axios = require('axios');


const discord_webhook = process.env.DISCORD_WEBHOOK
// Date you want to purchase movie tickets for
const date = "7/30/2023"
// ID of movie you want tickets for
const movie = "34071"
// ID of theatre you want to go to
const theatre = "7402"
var movie_name;

const showtimes_endpoint = `https://apis.cineplex.com/prod/cpx/theatrical/api/v1/showtimes?language=en&locationId=${theatre}&date=${date}&filmId=${movie}`

const config = {
  headers:{
    "Ocp-Apim-Subscription-Key": "dcdac5601d864addbc2675a2e96cb1f8",
    "Accept": "*/*",
    "Accept-Encoding": "*",
    "Accept-language": "en-US,en;q=0.9",
  }
};

async function check_showtimes() {
  const res = await axios.get(showtimes_endpoint, config);
  const res_json = res.data
  console.log(res_json)
  if (res_json != "\"\"" && res_json != null && res_json != ""){
    const theatre_name = res_json[0].theatre
    console.log(theatre_name)
    const showings = res_json[0].dates[0].movies[0].experiences[0].sessions
    console.log(showings)

    const movie_name = res_json[0].dates[0].movies[0].name
    console.log(movie_name)
    const movie_poster = res_json[0].dates[0].movies[0].smallPosterImageUrl
    console.log(movie_poster)
    send_discord(showings, movie_name, movie_poster)
  }else{
    console.log(`No showings available yet for ${date}`)
  }
  
}

function format_message(showings, movie_name, movie_poster) {
  
  const message = [
    {
      title: `Showings for ${movie_name} on ${date}`,
      image: {
        url: movie_poster
      },
      fields: [],
    },
  ];
  showings.forEach((showing)=>{
    seatMapUrl=showing.seatMapUrl
    ticketingUrl=showing.ticketingUrl
    showStartDateTime=showing.showStartDateTime
    seatsRemaining=showing.seatsRemaining
    isSoldOut=showing.isSoldOut
    message[0].fields.push({
      name: `[${(isSoldOut ? "SOLD OUT" : "ON SALE")}] ${(isSoldOut ? "" : `(${seatsRemaining} Seats Remaining)`)} ${showStartDateTime.substring(11)}`,
      value: `[Ticketing](${ticketingUrl})\n[Seatmap](${seatMapUrl})`
    })
    console.log(showing.seatMapUrl)
    console.log(showing.ticketingUrl)
    console.log(showing.showStartDateTime)
    console.log(showing.seatsRemaining)
    console.log(showing.isSoldOut)
  })
  return message
}

function send_discord(showings, movie_name, movie_poster) {
  console.log("=====================================================")
  console.log("Sending Discord Message")
  const embeds = format_message(showings, movie_name, movie_poster)
  // console.log(message)
  const data = JSON.stringify({ embeds });
  const config = {
    method: "POST",
    url: discord_webhook, // https://discord.com/webhook/url/here
    headers: { "Content-Type": "application/json" },
    data: data,
  };
  // console.log(config)
  axios(config)
  // .then((response) => {
  //   console.log("Webhook delivered successfully");
  //   return response;
  // })
  // .catch((error) => {
  //   console.log(error);
  //   return error;
  // });
}


check_showtimes()
