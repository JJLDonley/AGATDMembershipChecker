const AGA_URL = "https://corsproxy.io/?url=https://aga-functions.azurewebsites.net/api/GenerateTDListB"

const TDList = {};

async function fetchAndParseData() {
  try {
    const response = await fetch(AGA_URL);
    const textData = await response.text();
    parseCSV(textData);
    console.log(TDList);
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

function parseCSV(data) {
  const rows = data.trim().split("\n");

  rows.forEach((row) => {
    const columns = row.split("\t").map((col) => col.trim());

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
    };
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
    const idList = aga_ids.value
      .replace(/[\s,]+/g, " ")
      .trim()
      .split(" ")
      .filter((id) => id);

    idList.forEach((id) => {
      if (isNaN(id)) {
        alert("AGA ID is not a number: " + id);
        return;
      }
    });

    return idList;
  } catch (error) {
    alert("Error parsing AGA IDs");
  }
}

function normalizeExpDate(expDate) {
  if (!expDate || expDate === " " || expDate === "undefined") {
    return null;
  }
  return expDate;
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

  output.innerHTML = players
    .map((player) => {
      if (player.valid === false) {
        return `<div style="color: red">${player.id} Invalid AGA ID</div>`;
      }

      const expDate = normalizeExpDate(player.ExpDate);
      const parsedExpDate = expDate ? new Date(expDate) : null;
      const isLifetime = player.Type === "Life";
      const isValid = isLifetime || (parsedExpDate && parsedExpDate >= new Date(date));
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
    const randomIndex = Math.floor(Math.random() * Object.keys(TDList).length);
    const randomId = Object.keys(TDList)[randomIndex];
    ids += randomId + ",";
  }
  return ids;
}
