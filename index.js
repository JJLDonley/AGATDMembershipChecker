const AGA_URL =
  "https://corsproxy.io/?" +
  encodeURIComponent(
    "https://aga-functions.azurewebsites.net/api/GenerateTDListB"
  );

const TDList = {};

async function fetchAndParseData() {
  try {
    // Fetch CSV data from the URL
    const response = await fetch(AGA_URL);
    const textData = await response.text();

    // Parse CSV data
    parseCSV(textData);

    // Log the TDList for verification
    console.log(TDList);
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

function parseCSV(data) {
  const rows = data.trim().split("\n"); // Split data into rows

  rows.forEach((row) => {
    const columns = row.split("\t").map((col) => col.trim()); // Split by tab and trim each column

    const name = columns[0].split(", ");
    const first = name[1];
    const last = name[0];
    const id = columns[1];
    const comp = columns[2];
    const rating = columns[3];
    const expDate = columns[4];
    const club = columns[5];
    const state = columns[6];
    const sigma = columns[7];
    const registered = columns[8];

    TDList[id] = {
      First: first,
      Last: last,
      ID: id,
      Comp: comp,
      Rating: rating,
      ExpDate: expDate,
      Club: club,
      State: state,
      Sigma: sigma,
      Registered: registered,
    }; // Create a new player object with ID as key
  });
}

window.onload = function () {
  fetchAndParseData();
  console.log("TDList:", TDList);
};

const aga_ids = document.getElementById("aga-ids");
const tournament_date = document.getElementById("tournament-date");
const submit_button = document.getElementById("submit-button");
const output = document.getElementById("membership-output");

submit_button.addEventListener("click", function () {
  const ids = aga_ids.value.split(",");
  const date = tournament_date.value;

  const players = ids.map((id) => TDList[id]);
  const validPlayersWithExpDate = players.filter((player) => player && player.ExpDate);
  //output to membership-output
  //color red if membership is expired
  //color green if membership is valid

  output.innerHTML = validPlayersWithExpDate
    .map((player) => {
      const expDate = new Date(player.ExpDate);
      const isExpired = expDate < new Date(date);
      const color = isExpired ? "red" : "green";

      return `<div style="color: ${color}">${player.ID}: ${player.First} ${player.Last} - ${player.ExpDate} - ${isExpired ? "Expired" : "Valid"}</div>`;
    })
    .join("");


  console.log("Players:", players);
  console.log("Date:", date);
});

function generateRandomIDs(size) {
  let ids = "";
  for (let i = 0; i < size; i++) {
    // get id from TDList
    const randomIndex = Math.floor(Math.random() * Object.keys(TDList).length);
    const randomId = Object.keys(TDList)[randomIndex];
    ids += randomId + ",";
  }
  return ids
}

