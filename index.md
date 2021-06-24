---
layout: page
title: Home
---

<h1 class="page-title">Howdy!</h1>

<!--
<p class="message">
  Hey there! This page is included as an example. Feel free to customize it for your own use upon downloading. Carry on!
</p>
-->

I'm a software engineer and team lead from Nova Scotia, Canada. Since 2017 I've been building awesome products at [REDspace](http://www.redspace.com) where I have specialized in React, Golang, Node, and vanilla JS. Before that I worked on [The Golf Club](http://www.hb-studios.com/portfolio-item/the-golf-club/) and it's sequel at [HB Studios](http://www.hb-studios.com/).

Welcome to my site. It's built using [Jekyll](https://jekyllrb.com/) and [Github Pages](https://pages.github.com/), and uses the theme [Hyde](http://hyde.getpoole.com/). The backround in the menu area is using my [mazetoy]({{ site.url }}/projects/2017/03/17/maze-toy/) maze visualisation project.

## Contact

You can usually find me driving around Nova Scotia, but if you'd prefer the web:

* [Github](https://github.com/konamacona)
* [Facebook](https://www.facebook.com/mitchell.keenan)
* [LinkedIn](https://www.linkedin.com/in/mitch-keenan/)
* [mail@mitchkeenan.com](mailto:mail@mitchkeenan.com)

## Recent Posts

<div>
  {% for post in site.posts limit:3 %}
  <div>
    <h4>
      <a href="{{ post.url }}">{{ post.title }}</a> - {{ post.date | date: '%b %d, %Y' }}
    </h4>
  </div>
  {% endfor %}
</div>
