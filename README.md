# Default Starter Kit for JavaScript

[![Deploy to Fastly](https://deploy.edgecompute.app/button)](https://deploy.edgecompute.app/fastly/compute-starter-kit-javascript-default)

A little demontration of use the `User-Agent` header, Fastly Compute, KV Store and SimpleCache API.

## Features

* Generating a color background for a User-Agent header
* Storing the value in a cloud backed KV store
* Caching the value

When a request arrives, the code is implementing the following logic:

* A cache lookup on Base64 value of `User-Agent` is performed. If found in cache, the value is delivered from the cache. 
* If a cache miss, a KV lookup is performed. If the value found stored it's delivered from the store and cached.
* If a KV store lookup fails the value is generated (a heavy compute or an origin trip implied here). Then value is stored and cached for 60s.


## Understanding the code

This starter is intentionally lightweight, and requires no dependencies aside from the [`@fastly/js-compute`](https://www.npmjs.com/package/@fastly/js-compute) npm package. 

The code doesn't require the use of any backends. Once deployed, you will have a Fastly service running on Compute that can generate synthetic responses at the edge.
