---
published: false
layout: post
category: blog
tags:
  - web
  - php
  - wordpress
---
![Image of an frustrated dev](https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1948&q=80)

Very quick one, more of a note to self that I can reference in the future. In order to debug php on a wordpress site, do the following:

```php
// Create the file php-errors.log next to wp-config.php, ensure it's writable
// Add the following to wp-config.php
@ini_set('log_errors','On'); // enable or disable php error logging (use 'On' or 'Off')
@ini_set('display_errors','Off'); // enable or disable public display of errors (use 'On' or 'Off')
@ini_set('error_log','./php-errors.log');
```

This turns on php logging and pipes the logs into `php-errors.log`.
