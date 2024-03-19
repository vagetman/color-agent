/// <reference types="@fastly/js-compute" />
import { env } from "fastly:env";
import { KVStore } from "fastly:kv-store";

// the default state is Cached. it's overwritten for cache-miss
let details = "Cached";

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  // Log service version
  console.log("FASTLY_SERVICE_VERSION:", env("FASTLY_SERVICE_VERSION", "localhost"));

  let HOST = env("FASTLY_HOSTNAME");
  
  // Get the client request.
  let req = event.request;

  // Filter requests that have unexpected methods.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return new Response("This method is not allowed", {
      status: 405,
    });
  }

  // retrieve request URL
  let url = new URL(req.url);

  // If request is to the `/` path...
  if (url.pathname === "/") {

    const ua = req.headers.get("User-Agent");
    // make Base64 version of the UA header to use as a key
    const ua_key = btoa(ua);
    
    let hexColor = "";
    let cache = null;

    if (HOST !== "localhost") {
      cache = await SimpleCache.getOrSet(ua_key, async () => {
        // details = "Not Cached";
        return {
          value: await fetchMe(ua, ua_key),
          ttl: 60
        }
      });
      console.log("cache: ", cache);
      await cache.text().then((value) => hexColor = value);
    } else {
      hexColor = await fetchMe(ua, ua_key);
    }

    const welcomePage = `<!DOCTYPE html>
<html>
<head>
<title>Colored Agents</title>
</head>
<body style="background:#${hexColor}">

<h1>The User-Agent color is ${hexColor}</h1>
<h2>${details}</h2>

</body>
</html>`;

    // Send a default synthetic response.
    return new Response(welcomePage, {
      status: 200,
      headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
    });
  }

  // Catch all other requests and return a 404.
  return new Response("The page you requested could not be found", {
    status: 404,
  });
}

var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '';
  for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

async function fetchMe(ua, ua_key) {
  const store = new KVStore("demo_ua_store");
  const entry = await store.get(ua_key);
  let hexColor = "";
  if (entry) {
    hexColor = await entry.text();
    details = "Stored";
  } else {
    hexColor = stringToColour(ua);
    details = "Generated"
    await store.put(ua_key, hexColor);
  }
  return hexColor;
}
