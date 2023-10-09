---
title: Bootstrapping a simple fullstack app with serverless
author: "Christian"
date: "2023-10-08T00:00:00.001Z"
description: Make side projects fun again
splashUrl: https://source.unsplash.com/kXftOLdckGA/4752x3168
splashAuthor: Raimond Klavins
splashAuthorUrl: https://unsplash.com/@raimondklavins
---

Sometimes, you have an idea for a little web app. You can do a lot with just frontend, but maybe you need little piece of something that traditionally lives on the backend, like integrating with an external API.

I recently had such an idea! You can [check it out here](https://ynapp.netlify.app), and the [source code here](https://github.com/cdanielsen/next-long-pass). The backstory: when I was learning React in TYOOL 2017 or so, I built a little frontend-only app to practice. It would generate a random passphrase and had some options for configuring the output. Like most side-projects, I took it as far as I wanted to go and then... abandoned it. Maintenance is hard when it's just for you.

I am in between jobs at the moment [(give me a holler if you'd like to talk!)](/about), and thought it would be a fun exercise to resurrect this little side project as a break from job hunting. I also thought it would be a nice way to survey the ecosystem for the latest and greatest in bootstrapping a React app and all the associated tooling around that. Finally, I thought it would be nice to improve the original app a bit by not just providing users with a passphrase, but a little mnemonic for remembering it - a perfect job for generative AI! [Open AI](https://openai.com/) (of ChatGPT fame) [has an API](https://platform.openai.com/docs/introduction) and even a [TypeScript SDK](https://www.npmjs.com/package/openai) you can use to access it.

That feature would require a backend though. Although you can make calls to an external service directly from the browser, there are two pretty big limiting factors:

- **CORS** For security reasons, browsers generally only want frontend javascript making network requests to the [same domain it's being served on](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). There are good reasons for this (see: [Cross Site Scripting](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting)), but there are exceptions for relatively simple requests, or to services that explicitly indicate they're open to requests from external domains via special CORS headers. CORS is a complex topic, but there's a lovely little web app called [Will It Cors](https://httptoolkit.com/will-it-cors/) that can help you determine if your request meets these pretty strict requirements.
- **Protecting secrets** Even if you can make your requests from the brower, many APIs require you authenticate when sending requests by passing some kind of credentials, like an API key. This is a _secret_ you do not want exposed, especially since some APIs charge you money based on usage. But if you're making the call from a client's browser, anyone can easily see it by looking at the network activity!

So, my updated app needed some kind of backend. My first thought was to make a simple Express.js app for my backend server. Express could serve serve the client code as a static asset and also serve an API with a single endpoint. That endpoint would query Open AI's API internally, so no CORS or secret leaking to worry about. This would work, but it just seemed so... _heavy_. Do we really need to bring in an entire server framework just to host a single endpoint API? Then I remembered: this seemed like a perfect case for serverless functions!

If you're not familiar, the idea with a serverless function is exposing the ability to trigger some code that will run on a hosted server somewhere, and then respond back to the requesting client. The especially cool part is this happens _on demand_. A call comes in, serverless function spins up/executes/responds, and then (effectively) vanishes into the ether until the next call. No long running server sitting there listening/idling for 99% of your toy app's life, and none of all the extra boilerplate you don't need in setting up a full on server framework like Express.

There are quite a few options for serverless function platforms (AWS Lambda, Google Cloud Functions). I went with [Netlify Functions](https://www.netlify.com/products/functions/), because they provide a very nice development and deployment platform for small projects, and a simple interface for defining and consuming a function. You get 125k (!) function invocations per month for free, pretty uhhh... ample for prototyping something. And using the [Netlify CLI](https://docs.netlify.com/cli/get-started/), you can wrap your frontend project and then deploy it on Netlify's hosting service, right from your machine! I found this development experience so nice I'm sure I'll use it again, so I've written up this walkthrough of setting up a simple Netlify powered React app, with a Netlify Function API for the backend.


### Pre-requisites / Assumptions

- Your machine should have a newish version of node.js/npm
- Create a free account at netlify.com, which we'll need the credentials for in a moment
- You should have a general familiarity with the command line, npm, and React
- Optional but recommended: you should have an account at github.com, and know how to create repositories under your account

_Disclaimer:_ This guide was written with the `16.5.1` version of the Netlify CLI and `4.4.11` of Vite, so things may look a bit different if you're using a different version!

Let's start by boostraping a frontend using [Vite](https://vitejs.dev/), the more robust successor to Create React App. Note that Vite supports several "templates" for creating a frontend (Svelte, Vue, etc), so choose one that works for you if React/TypeScript isn't your cup of tea! This guide will use that one though.

```sh
$ npm create vite@latest my-sweet-app -- --template react-ts
```

This will create a new npm project/directory called `my-sweet-app` you should navigate to. Aside from the standard `package.json`, this folder has some sensible configuration files like a `.gitignore`, an `index.html` file that link your compiled javascript bundle, and a `src` directory where some starter/boilerplate React files live. Look around and tweak some things if you like (e.g. the page title and the app project name). You can also install the project dependencies and launch the development server with the following command

```sh
$ npm install && npm run dev
```

Once you're satisfied, intialize the directory as a git repo and commit everything as your first commit with something like this

```sh
$ git init && git add -A && git commit -m "add intial Vite bootstrap files"
```

Optional, but recommended: create a new repo at github.com and link it to your local one (replacing the `YourGithubName` and `YourRepoSlug` placeholders). While not required, this will unlock a lot of nice Netlify features, like continuosly deploying your site to a `netlify.app` domain when the `main` branch is updated and branch/PR preview builds/deploys!

```sh
$ git remote add origin git@github.com:YourGithubName/YourRepoSlug.git
```

Now install the Netlify CLI as a development dependency. Note: you could install this globally, but I generally don't like global npm packages and prefer to explitly declare all the packages needed to develop an application as dev dependencies

```sh
$ npm i -D netlify-cli
```

You can invoke the local copy of the Netlify CLI by using npm's `npx` utility. You can use either `netlify-cli` or the more terse alias `ntl`. I'll use the latter for this guide just to save some keystrokes

```sh
$ npx ntl
```

This should show a list of all the handy things you can do with the Netlify CLI, from running a dev server to deploying your site.

>>>
Wait... another dev server? This is a bit confusing, but yes. The idea is that netlify will act as the orchestrater/front door of your *entire* app (both the client-side code _and_ the "backend" function(s)). For local development, it will do this by asking you how to launch your client application (in this case with _Vite's_ dev server), and then proxing requests from netlify's dev server to Vite's 😅. This way netlify can also serve/proxy local versions of netlify function(s), which you can access from your client code by sending requests to special _routes_, which we'll get to in a bit.
>>>

Next you'll want to authenticate your the CLI so you can actually perform most of those actions

```sh
$ npx ntl login
```

This will open a browser tab that will ask you to login to netlify and authorize the CLI to perform actions on your netlify account. After doing this, your command line should say something like this

```sh
You are now logged into your Netlify account!

Run netlify status for account details

To see all available commands run: netlify help
```

Now we'll intiate a netlify project in our repo with the following

```sh
$ npx ntl init
```

This should ask you if you want to connect to an existing Netlify site or start a new one. Choose the latter and answer a few more questions. You should now have a new Netlify site with a unique URL and id.

Next, Netlify will ask you for permission to access your GitHub account so it can configure the aforementioned continuous deployment of your site. You can do this either via GitHub auth or providing a GitHub personal access token. I went with the former.

Now it will ask for a command to build your site. I tend to just use npm scripts, so I would use the default `npm run build`, but perhaps you want to use `yarn` or like having some other wrapper over your build process. That's all fine, the important thing to remember is we're just providing some information so Netlify can generate a config file to reference, and you can always tweak these things later. Speaking of, say yes to generating a `netlify.toml` file in the next question or so.

Hopefully Netlify was succesfully able to add a deploy key to your repo and configure a notification hook so it can watch your repo for changes. If so, you should see something like this:

```sh
Deploy key added!

Creating Netlify GitHub Notification Hooks...
Netlify Notification Hooks configured!

Success! Netlify CI/CD Configured!

This site is now configured to automatically deploy from github branches & pull requests

Next steps:

  git push       Push to your git repository to trigger new site builds
  netlify open   Open the Netlify admin URL of your site
```

Huzzah! Your directory should now look as follows

```
.eslintrc.cjs
.git/
.gitignore
.netlify/
README.md
index.html
netlify.toml
node_modules/
package-lock.json
package.json
public/
src/
tsconfig.json
tsconfig.node.json
vite.config.ts
```

The new `.netlify` folder is internal metadata for Netlify/ignored by git so you can also ignore it. The `netlify.toml` file is where all the configuration will live that will help Netlify manage your app. There are lots of things you can declare here ([check out the docs](https://docs.netlify.com/configure-builds/file-based-configuration/) for more info), but for now we want to use the Netlify dev server instead of Vite's directly, so let's uncomment/edit the following lines toward the bottom

```toml
  [dev]
    command = "npm run dev" # Command to start the client (Vite) dev server
    port = 3000             # Port that the Netlify dev server will be listening on
    publish = "dist"        # Folder where the client production bundle is generated
```

Now run the following

```sh
$ npx ntl dev
```

If all goes well, you should see something similar to the following output in your terminal, indicating the Netlify CLI has detected you want it to launch a Vite app, invoking the command we provided in the `netlify.toml` file to do so, and proxying requests from a server at `localhost:3000` to the vite app running on `localhost:5173`. If you go to `localhost:3000` in a browser tab, you should see the boilerplate/starter vite content 🎉

```sh
◈ Netlify Dev ◈
◈ Injecting environment variable values for all scopes
◈ Ignored general context env var: LANG (defined in process)
◈ Setting up local development server
◈ Starting Netlify Dev with Vite

> my-sweet-app@0.0.0 dev
> vite


  VITE v4.4.11  ready in 601 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
✔ Waiting for framework port 5173. This can be configured using the 'targetPort' property in the netlify.toml

   ┌─────────────────────────────────────────────────┐
   │                                                 │
   │   ◈ Server now ready on http://localhost:3000   │
   │                                                 │
   └─────────────────────────────────────────────────┘
```

Now that we have a working frontend, let's setup a Netlify Function with the CLI to act as our lean backend.

```sh
npx ntl functions:create --name my-cool-function
```

This will ask you some questions. I suggest you'll want a `Serverless Function` with `TypeScript` and a `typescript-hello-world` setup. Some needed dependencies will be installed and you'll have a new file at `netlify/functions/my-cool-function/my-cool-function.ts` Let's check it out

```ts
// netlify/functions/my-cool-function/my-cool-function.ts
import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  const { name = 'stranger' } = event.queryStringParameters

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, ${name}!`,
    }),
  }
}
```

This file exports a named async function called `handler` that recieves two arguments by default: `event` and `context`. You can [read up on these here](https://docs.netlify.com/functions/create/?fn-language=ts#synchronous-function-format); they provide useful request information you can use to drive the functionality you want your function to perform. In this example, they're attempting to reference a `name` value from the query string that came in from the request, defaulting it to "stranger" if it wasn't provided.

It then returns an http response with a `statusCode` and a stringified JSON `body`. Next we'll talk about how to invoke this function from the client, but take a moment to imagine the possibilities here! You can trigger an async function to run in a node.js environment that can query an external API, write to a remote DB somewhere, etc. and then respond to the client accordingly! Very powerful.

To keep things simple, let's just consume the existing function from our React app. Netlify will expose our function at the namespaced `/.netlify/functions/my-cool-function` route. We could hit that route directly, but aside from it being rather ugly, it would be nicer to expose a more semantic name to the client, like `/api/greeting`. This also has the benefit of decoupling our client from the function implementation: if we want to switch out Netlify for something like AWS lambda down the road, we won't have to update the client code. We can accomplish this by defining some Netlify _redirects_. Edit the `netlify.toml` file as follows:

```toml
  # netlify.toml
  [[redirects]]
    from ="/api/greeting"
    to ="/.netlify/functions/my-cool-function"
    status = 200
  
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
```

What's going on here? We're doing two things:
 - For any requests that come in to `/api/greeting` route, redirect it to the `/.netlify/functions/my-cool-functions` route. The 200 status means there will be no visible redirect on the client's browser: they will just see the request to `api/greeting`.

 - The second redirect is a general/default "splat" that says if the client tries to request anything that isn't to `/api/greeting` (`/api/insult`, `/wat`, etc.) just serve them the root route. Note that order is important, the router will use the first route that matches from top to bottom, so this route should generally go last.

Now we have a nice semantic route to query from our React code. Let's add a folder under source called `api` and a file under that called `index.ts` with the following in it

```ts
// src/api/index.ts
export const getGreeting = async (name?: string) => {
  const query = name ? `?name=${name}` : '';
  return fetch(`/api/greeting${query}`, {
    method: 'GET'
  }).then(response => response.json())
}

```

This defines and exports an async function using the browser's `fetch` api that we can use to call the netlify function, passing an optional name that will be injected as a query string parameter and returning the response in `json` format. Let's setup a very basic form to submit names to be greeted. Replace your App.tsx as follows:

```tsx
// App.tsx
import { useState } from "react";
import { getGreeting } from "./api";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  const handleGetGreeting = (nameToGreet: string) => {
    (async () => {
      try {
        const { message } = await getGreeting(nameToGreet);
        setGreeting(message);
      } catch (e) {
        console.error(e);
      }
    })();
  };

  return (
    <main className="App__container">
      <div className="NameForm__container">
        <input
          className="NameForm__input"
          aria-label="An input field for a name to greet"
          type="text"
          value={name}
          onChange={({ target }) => setName(target.value)}
        />
        <button
          type="button"
          className="NameForm__submit-button"
          aria-label="Submit the name to be greeted"
          onClick={() => handleGetGreeting(name)}
        >
          Get greeting
        </button>
      </div>
      {greeting ? (
        <h3 aria-label="A greeting for the submitted name">{greeting}</h3>
      ) : null}
    </main>
  );
}

export default App;

```

Optional: You can update `App.css` with this for some basic styling


```css
/* App.css */
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.NameForm__container {
  display: flex;
}

.NameForm__input {
  width: 25rem;
}
```


Test your app at `localhost:3000`. If all went well, you should get a greeting back from your function when you click the "Get greeting" button.

Congrats: you just invoked a serverless function! From here, you could modify the function to do something more interesting than greet you, or add additional functions and redirects to build out a full api. When you push code to github, Netlify will automatically build and deploy your optimized production bundle to it's edge network and serve your function calls.
