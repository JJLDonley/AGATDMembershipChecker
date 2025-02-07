const AGA_URL = "https://aga-functions.azurewebsites.net/api/GenerateTDListB"

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
    const type = columns[2];
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
      Type: type,
      Rating: rating,
      ExpDate: expDate,
      Club: club,
      State: state,
      Sigma: sigma,
      Registered: registered,
      valid: true,
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

function smartParser() {
  try {
    const commas = aga_ids.value.includes(",");
    const newline = aga_ids.value.includes("\n");
    const space = aga_ids.value.includes(" ");
    if (commas && newline) {
      alert("Please use only one delimiter( , or newline)");
      return;
    }

    let idList = [];

    if (commas) {
      idList = aga_ids.value.split(",");
    } else if (newline) {
      idList = aga_ids.value.split("\n");
    } else if (space) {
      idList = aga_ids.value.split(" ");
    } else {
      idList = aga_ids.value.split(",");
    }

    idList = idList.map((id) => id.trim()); // remove leading and trailing spaces
    idList = idList.filter((id) => id); // remove empty strings

    //check if the ids are all numbers
    // throw error if not
    idList.forEach((id) => {
      if (!id) {
        alert("AGA ID is empty " + id);
        return;
      }
      if (isNaN(id)) {
        alert("AGA ID is not a number " + id);
        return;
      }
    });

    return idList;
  } catch (error) {
    alert("Error parsing AGA IDs");
  }
}

submit_button.addEventListener("click", function () {
  const ids = smartParser();
  const date = tournament_date.value;

  const players = ids.map((id) => {
    if (!TDList[id]) {
      return { valid: false, id: id };
    }
    return TDList[id];
  });
  //output to membership-output
  //color red if membership is expired
  //color green if membership is valid

  output.innerHTML = players
    .map((player) => {
      console.log("Player:", player);
      if (player.valid === false) {
        return `<div style="color: red">${player.id} Invalid AGA ID</div>`;
      }
      if (!player.ExpDate) {
        player.ExpDate = null;
      } else if (player.ExpDate == " ") {
        player.ExpDate = null;
      } else if (player.ExpDate == null) {
        player.ExpDate = null;
      } else if (player.ExpDate == "undefined") {
        player.ExpDate = null;
      }

      let expDate = player.ExpDate ? new Date(player.ExpDate) : null;
      const isLifetime = player.Type === "Life";
      const isValid = isLifetime || (expDate && expDate >= new Date(date));
      const color = isValid ? "green" : "red";

      return `<div style="color: ${color}">${player.ID}: ${player.First} ${
        player.Last
      } - ${player.ExpDate} - ${isValid ? "Valid" : "Expired"}</div>`;
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
  return ids;
}
