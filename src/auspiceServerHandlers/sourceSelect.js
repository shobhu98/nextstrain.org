const manifestHelpers = require("./manifests");

const urlToParts = (url) => {
  return url.replace(/^\/+/, "").replace(/\/+$/, "").split("/");
};


/* TO DO */
const REMOTE_DATA_LIVE_BASEURL = "http://data.nextstrain.org";
const REMOTE_DATA_STAGING_BASEURL = "http://staging.nextstrain.org";


const getSource = (url) => {
  let parts = urlToParts(url);
  if (parts[0] === "status") {
    parts = parts.slice(1);
  }
  if (!parts.length || (parts.length === 1 && parts[0] === '')) {
    return "live";
  }
  if (parts[0] === "local") return "local";
  else if (parts[0] === "staging") return "staging";
  else if (parts[0] === "community") return "github";
  return "live";
};

const guessTreeName = (parts) => {
  const guesses = ["HA", "NA", "PB1", "PB2", "PA", "NP", "NS", "MP", "L", "S"];
  for (const part of parts) {
    if (guesses.indexOf(part.toUpperCase()) !== -1) return part;
  }
  return undefined;
};

const splitUrlIntoParts = (url) => url
  .replace(/^\//, '')
  .replace(/\/$/, '')
  .replace(/^live\//, "")
  .split("/");

const constructPathToGet = (source, providedUrl, otherQueries) => {
  /* the path / URL is case sensitive */
  let auspiceURL; // the URL to be displayed in Auspice
  let fetchURL; // could be local path or http(s)://
  let secondTreeFetchURL;
  let datasetFields; // this _does not_ take into account the 2nd tree
  let treeName;

  const parts = splitUrlIntoParts(providedUrl);

  /* does the URL specify two trees? */
  let treeTwoName;
  for (let i=0; i<parts.length; i++) {
    if (parts[i].indexOf(":") !== -1) {
      [treeName, treeTwoName] = parts[i].split(":");
      parts[i] = treeName; // only use the first tree from now on
      break;
    }
  }
  if (!treeTwoName && otherQueries.deprecatedSecondTree) {
    treeTwoName = otherQueries.deprecatedSecondTree;
  }

  if (source === "github") {
    if (parts.length < 3) {
      throw new Error("Community URLs must be of format community/githubOrgName/repoName/...");
    }
    fetchURL = `https://rawgit.com/${parts[1]}/${parts[2]}/master/auspice`;
    auspiceURL = `community/${parts[1]}/`;
    datasetFields = parts.slice(2);
  } else if (source === "staging") {
    fetchURL = REMOTE_DATA_STAGING_BASEURL;
    auspiceURL = "staging/";
    datasetFields = manifestHelpers.checkFieldsAgainstManifest(parts.slice(1), source);
  } else {
    /* default (for nextstrain.org, this is the data.nextstrain S3 bucket) */
    fetchURL = REMOTE_DATA_LIVE_BASEURL;
    auspiceURL = "";
    datasetFields = manifestHelpers.checkFieldsAgainstManifest(parts, source);
  }

  if (!treeName) {
    treeName = guessTreeName(datasetFields);
  }
  if (treeTwoName) {
    const treeIdx = datasetFields.indexOf(treeName);
    const fieldsTT = datasetFields.slice();
    fieldsTT[treeIdx] = treeTwoName;
    secondTreeFetchURL = fetchURL + "/" + fieldsTT.join("_") + ".json";

    const fieldsAus = datasetFields.slice();
    fieldsAus[treeIdx] = `${treeName}:${treeTwoName}`;
    auspiceURL += fieldsAus.join("/");
  } else {
    auspiceURL += datasetFields.join("/");
  }

  fetchURL += `/${datasetFields.join("_")}`;
  if (otherQueries.type) {
    fetchURL += `_${otherQueries.type}`;
  }
  fetchURL += ".json";

  return {auspiceURL, fetchURL, secondTreeFetchURL, datasetFields, treeName, treeTwoName};
};


module.exports = {
  getSource,
  constructPathToGet,
  guessTreeName,
  splitUrlIntoParts
};
