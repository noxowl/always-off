/**
 * AlwaysOff. Remove spam site from Google search query.
 * @author Mirai Kim(Suyeong Rhie) <me@euc-kr.net>
 * @version 0.1
 * @license MIT
 */

const iconName = "icons/alwaysoff"

const urlPattern = [
    "https://*.google.com/search?*",
    "http://*.google.com/search?*",
    "https://*.google.co.kr/search?*",
    "http://*.google.co.kr/search?*",
]

const keywordPattern = [
    "namu.wiki",
    "namu.news",
    "arca.live"
]

const queryParam = "q"
const excludeOperator = "-site:"
const splitSeparator = " "

function alwaysOffToggleListener() {
    if (browser.webRequest.onBeforeRequest.hasListener(alwaysOffListener)) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    browser.webRequest.onBeforeRequest.addListener(
        alwaysOffListener,
        {urls: urlPattern},
        ["blocking"]
    );
    browser.browserAction.setIcon({path: iconName + "-on.png"});
}

function stopListening() {
    browser.webRequest.onBeforeRequest.removeListener(alwaysOffListener);
    browser.browserAction.setIcon({path: iconName + "-off.png"});
}

function alwaysOffListener(requestDetails) {
    let url = new URL(requestDetails.url);
    let extractedQueries = extractQuery(url);
    if (!isAlreadyModified(extractedQueries)) {
        return {
            redirectUrl: modifyUrl(url, alwaysOff(extractedQueries))
        };
    }
}

function alwaysOff(queryString) {
    let tempQuery = queryString.split(splitSeparator);
    for (let keyword of keywordPattern) {
        tempQuery.push(excludeOperator + keyword)
    }
    return tempQuery.join(splitSeparator);
}

function extractQuery(originUrl) {
    return originUrl.searchParams.get(queryParam)
}

function modifyUrl(originUri, modifiedQuery) {
    originUri.searchParams.set(queryParam, modifiedQuery)
    return originUri.toString()
}

function isAlreadyModified(queries) {
    for (let keyword of keywordPattern) {
        if (queries.includes(excludeOperator + keyword)) {
            return true
        }
    }
    return false
}

browser.browserAction.onClicked.addListener(
    alwaysOffToggleListener
)

startListening()