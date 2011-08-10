---
title  : This is Exciting!
author : trans
tags   : website
date   : 2009-08-24

--- markdown

# Another Static Website/Blogging Tool

If you were wondering, you are reading the old TigerOps.org blog. I have discontinued that
Wordpress-based blog due to spam overload, and have replaced it with this new site. Rather
than use Wordpress, this site is now running on [Brite](http://proutils.github.com/brite),
a home grown static website and weblog construction tool.

Now I know there are plenty of these out there, in particluar you have the [GitHub](http://github.com)
backed [Jekyll](http://wiki.github.com/mojombo/jekyll) and the very nicely designed
[Shinmun](http://www.matthias-georgi.de/shinmun), not to mention some of the senior tools 
like [Webby](http://webby.rubyforge.org/) and [Rote](http://rote.rubyforge.org/).
So, why do we need yet another? The reasoning is essentially two-fold.

--- markdown

1.     I am a knit pick. With each alternitive I found a few nagging points upon which I
       wanted to see a different approach taken.

2.     I wanted to see if I could push the boundries, absorbing what good I may from
       earlier systems (including my own stalled attempts) and contruct something
       more intuitve and yet more powerful.

With inline formats I think Brite has achieved that. You can easily have multiple types
of markups in a single page, in an elegant and relatively unobtrusive manner. (Yea, Wow!)

For example the document I am currently writing is in Markdown format. But...

--- textile

This is using textile, and...

--- rdoc

This is using RDoc's Simple Markup format.

--- html

<p>And this is raw HTML.</p>

--- markdown

Furthermore, formats are plugable. We already have [Coderay](http://coderay.rubyforge.org) 
syntax highlighter support and are looking to add MathML support soon too. So this feature
allows for some truly amazing quick and easy contruction of web documents.

Another innovation of Webrite is the non-separation of markup files from their
generated output. This means one does not have to worry about dealing with source
subdirectory and site desitnations and the copying static files. All the files stay right
where they are frist created. The markup files use special extensions (.post, .page, .layout)
to differentiate then from the .html results. One simply filters the list of files when
publishing.

Webrite is still in the very early stages of development. It still needs features such as
pagination and tagclouds. But it is coming along rapidly, and I look forward to what is
coming downt he road. Future innovations may include *aquisition* (a la Zope and UserLand Frontier),
as well as a realtime Rack-based server.

