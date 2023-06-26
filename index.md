---
layout: page
title: Home
---

<h1 class="page-title">Howdy!</h1>

I'm a web-focused software developer from Nova Scotia, Canada. I build world-class digital products for exciting clients with [Lazer Technologies](https://www.lazertechnologies.com/)!

Welcome to my site. The background in the menu area is using my [mazetoy]({{ site.url }}/projects/2018/03/17/maze-toy/) maze visualization project.

## Contact

* [Github](https://github.com/mitch-keenan)
* [LinkedIn](https://www.linkedin.com/in/mitch-keenan/)
* [mk@mitchkeenan.com](mailto:mk@mitchkeenan.com)

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
