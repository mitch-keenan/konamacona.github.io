---
layout: post
title: Web Unleashed: Responsive
category: blog
tags: [web, design, WU2018, accessibility]
---

# Responsive Design: Beyond Our Devices

Talk by [Ethan Marcotte](ethanmarcotte.com) at [Web Unleashed](https://fitc.ca/presentation/responsive-design-beyond-our-devices/)

## "Where are we going?"

This talk opened with the question of where the web is headed and what we as developers can do to anticipate the future. It emphasized that devices and screens are not always what we predict and that people do not always consume the web in ways we expect. Ethan implored us to ask ourselves the following question when designing and developing:

> **What if someone doesn't browse the web like I do?**

The rest of the talk surrounds and supports this point. What can we do to make the experiences we develop accessible and consistent accross all devices and browsing methods?

## Pages and Patterns

Instead of designing (and implementing) pages, we should look to design **patterns**. Ethan explains that having one or two breakpoints at "device boundries" for the page (or even each pattern) is no longer sufficient to give an ideal experience for todays users. Each pattern may have more or less style breakpoints than others to deliver optimal experiences on each device (and orientation).

// TODO: Insert GIF of many breakpointed component from slides.

## Design the Priority, Not the Layout

Next we were shown an example pattern from a site Ethan worked on called [The Toast](the-toast.net). The example in question was the following component which showed a related article. As you can see, the visual **layout** order and visual **priority** differ. When developing if we order the elements according to the layout (code block 1), we can easily re-create the mock, however this is an anti-pattern. Ethan tells us that the **markup** should follow the **priority order**, and any modifcations to that to create the **layout** should be applied via **styles** (code block 2).

// TODO: Insert code pens for 1st and 2nd example

This is important for accessibility and usablity reasons. Users who are not navigating using a mouse (keyboard, screen-reader, etc) will have a better experience when content is presented to them with the same order as the visual priority.

## Gracefully Supporting Features

>"Supporting doesn't mean giving the same experience"

Ethan used the following example from [The Guardian](#)'s home page to illustrate his next point. The component uses `display: flex;` in browsers which support it but it doesn't fall apart or use complicated fallbacks to re-create the same visual order when `flex` isn't supported. It's flex-less state is simple and still sufficient to convey it's message. Designing in this way, and looking at how your site appears with css features like `flex` turned off can assist in making your site more accessible and usable to all users.

// TODO: Insert guardian example comparison

## Device Agnostic Design

With the increasing popularity of devices like smart-watches, ultra-wide monitors, and touch-screen laptops; changing functionality using width-based breakpoints is becoming obsolete. Instead we should use `@supports` queries to apply feature related styles to those devices which support them. The examples shown included [hover]() and [touch]().

// TODO: May seem obvious? Additional examples needed

// TODO: Other notes to address
* Browsers don't care?
* Test for non-ideal conditions more
* Emphasize conditions/features instead of devices

## Style Guides / Pattern Libraries

//TODO Translate from notes
1. Visual Inventory
2. Name & Categorize
3. Create HTML/CSS versions

* Naming & Laguage --> Consistent Design
* "Atomic Web Design" - Brad Frost
	* Communication challenges
	* Not clear for agreement
	* "Atomic Classification" - Trent Walton
	* **Words** are extremely important to agree on to achieve shared understanding.

## Conclusion

//TODO Translate from notes
* The web is not evolving in a straight line.
* "mobile" is too narrow of a definition
* "Next Billion"