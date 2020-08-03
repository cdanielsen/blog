---
title: To hunt a killer (bug)
author: "Christian"
date: "2020-07-09T01:07:00.001Z"
description: Always check production
splashUrl: https://source.unsplash.com/dyGWrmJ_i4E/4137x3103
splashAuthor: Kai Wenzel
splashAuthorUrl: https://unsplash.com/@marcwieland95
---

This website has a bug - a nasty one. Well, it had one ([I fixed it](https://github.com/cdanielsen/blog/commit/3f2ebf5c27c1bdf3c50f9ea0e830c9fa71aaac57) in conjunction with publishing this blog post), but as this site is open source, you can check out the dastardly code that caused the problem [here](https://github.com/cdanielsen/blog/blob/2452c1f51ebdb055e91a5ec5c462aeecd3255be4/src/components/navSidebar.js).

My first professional job in development was as a QA engineer. QA seems to hold an odd place in the world of development. Almost everyone recognizes it as essential, but not many people seem to like doing it, or giving enough resources to people who do like doing it. As such, they usually get sub-optimal value out of it until they realize they really need it, and then it's probably too late.

So what does QA add to an overall development process? I would put it that as a QA engineer, your job is, basically, to try and break things. To look at some code, a UI, whatever is being built to be put out in the world, and to ask things like "how could this go wrong?" and "As a user, why would I hate this?"

This can be an insanely creative exercise that counter-intuitively often requires very little technical knowledge. That can actually be a distraction, because usually your job is to advocate for requirements and behaviors that matter to _end users_, who are often non-technical, and very much don't care about the clever implementation details. They just want that button to do what they expect when they click it.

Anyway. Part of being a good QA engineer is to champion regular testing, and lots of it. Manual tests. Automated tests. Unit/Integration/End-to-End tests. Performance Tests. Penetration Tests. You can't do all these things without an army, so a good QA process also prioritizes _risk_ by asking things like "what features do we really care about/would be an emergency if they broke?" "what's likely to break because we mess with it a lot?" "what code should we be careful with because it has many dependents?"

I think every developer should do a tour at some point as a QA engineer, because it really forces you to focus on what actually matters about writing code: making something that's useful for humans. If something isn't useful for a user, it is pretty worthless, no matter how clever the code behind it is. If you're not convinced, let Ryan Dahl convert you with this [delightful rant](https://gist.githubusercontent.com/cookrn/4015437/raw/562705ddafa0badc2a054335997fb69e267f7aaa/rant.md).

And that brings us (finally!) to the bug.

When I thought about what I wanted to put on this blog, I liked the idea of an old fashioned blogroll - a set of links to other people I follow as an appreciation for the unknown mentorship they've given me. It didn't need to be fancy: just their names as links to their respective sites.

I initially just organized the list alphabetically by last name. But then I thought, why not randomize the order they appear each time, so Jake Archibald (who I do admire very much!) doesn't get an implicit preference of always being at the top of the list. I grabbed an array randomizing package from npm and worked it in as part of the React component that renders the names and links.

Worked great locally! On each refresh I saw the names pleasingly reordered each time the page loaded. _Such clever UX_ I probably thought (_narrator: but he wasn't clever..._) And then I noticed the other day - to my horror - months after deploying this change, that on an initial load in the production site only... _the links didn't match up with the names_.

:scream:

### Postmortem

**Why did this work locally but not on the deployed site?**

Turns out that [this is a thing](https://github.com/gatsbyjs/gatsby/issues/10706) with Gatsby/React that can bite you if you're not careful. Gatsby is a static site generator, compiling React code / GraphQL queries and all the other cool kid stuff into plain old HTML that can be served and rendered very efficiently, while still allowing client (browser) side React to take over and do dynamic rendering once it's loaded. Unfortunately, as this post [deftly explains](https://joshwcomeau.com/react/the-perils-of-rehydration), Gatsby uses different React APIs between development mode and a production build.

In my case, a user initially loads `hotmess.codes` and receives a SSR html page with a list of names and attached links. Then the client side React takes over and goes through the rehydration process, _reshuffling the array of names_, and then getting confused because it doesn't match what was sent from the server. The docs mention that it will [earnestly/adorably](https://reactjs.org/docs/react-dom.html#hydrate) try to at least fix text content, but all bets are off for things like href attributes, sadly resulting in my scrambled list.

Interestingly, when the user refreshes any time after the initial load, the list fixes itself. I don't quite understand this bit yet, but think it has to do with the fact that my gatsby site caches content with a service worker.

Anyway, there were a couple of ways to solve this, but I like the "two pass render" solution of effectively treating this randomized array for what it is: dynamic data. I used the useEffect hook to randomize the list only after the component has mounted on the client.

**How did I miss this?**

In hindsight, I feel a bit less bad about missing this because this is a very subtle bug that only shows up on an initial page load and only in the production build. Unfortunately, I imagine at least a few people have come to this site, scrolled over the blogroll names, clicked on one that took them to the wrong place and went "Whelp, this guy has a cute kid but his web developer credibility just went out the window. Back to Reddit..."

I smoke test the site manually after I deploy changes, but generally I focus on what I've changed and the blogroll has been pretty static. Clearly I did not check it in production after I made the randomizing change. That's a fail.

**How do I prevent this from happening again?**

An automated test! I have some decent experience with UI testing libraries, and I'll be adding some [Cypress](https://www.cypress.io) tests to this site as part of my development pipeline in another post.