---
title      : Quiet Revolt Against the FHS?
author     : trans
categories : [ruby, require]
date       : 2009-10-26
layout     : post
---

Prompted by the disocvery of improper use of relative require in a number or Ruby project's executables, my last [post](http://protuils.github.com/2009/10/proper-require.html) dicussed <i>why</i> and <i>when</i> to avoid using relative require. To summarize, there are two broad reasons to avoid relative loading. The first is simply YAGNI. In most cases you simply don't need to do it. Your script is on the $LOAD_PATH and all that is needed is the normal <code>require 'mylib/mydir/myfile'</code> to load it. The second, and up until today I felt the more important concern, is conformance to the [File Hierarchy Standard](http://www.pathname.com/fhs/). While there is plenty of room to use relative requires and not tread on the FHS, it is easy enough to run afoul if one is not careful and aware of the issues. Such was the case with the executables.

Now I have discovered that another popular Ruby program is "broken" with regards to the FHS -- RDoc. In more recent versions, RDoc designed it's auto-loading of 3rd party templates to use <code>lib/rdoc/discover.rb</code>. In other words, if you want to create a template "plug-in" for RDoc you need to have a <code>lib/rdoc/discover.rb</code> file in your project in which you require the file(s) that contain your actual plug-in code. There is one serious problem with this. If more than one such 3rd-party template project is installed via an old-fashioned site_ruby install (eg. using setup.rb), then the last installed project's <code>discover.rb</code> file will clobber the prior's.

As a gem user you might not think it a big deal, but I can tell you that Linux distro maintainers do care. Any Ruby library they decide is worthy of a distro package, in particular a <code>.deb</code> package, they must ensure it conforms to the FHS. [Ruby Facets](http://facets.rubyforge.org), for instance, is slightly difficult in site install because it has two separate load paths. I received more that one nasty email about that when I no longer shipped a <code>setup.rb</code> script with the package. I have since updated the stand-alone version of [Ruby Setup](http://proutils.github.com/setup) to handle such an install properly so long a <code>meta/loadpath</code> file is provided.

But now I have to wonder. If RDoc has a site install flaw in it's latest design, and the aforementioned use of relative loading in bin scripts in other projects is likewise flawed, not to mention the numerous other violations that are surely out there... Is there a quiet revolution against the FHS going-on? Perhaps a revolution by default, because people don't know any better or forget to take it into account?

Honestly, I have to say I hope so. In years past I had attempted to rail against the FHS. I even used [GoboLinux](http://gobolinux.org/) as my main platform for a while. But as much as I would spout about the need to move beyond the FHS, along with [other voices](http://gobolinux.org/index.php?lang=en_US&page=doc/articles/clueless), there never seemed to be any progress. We were stuck. And so I had given up and settled myself with the FHS way of doing things. (No doubt, this accounts in part for why I am so acutely aware Ruby code  that breaks under the standard.) But I have never been happy with it. I could only hope that one day, somehow, it would change. And maybe it has...

Are those of you using RubyGems, and using relative requires, ready to stand with your code, in defiance of the FHS, indifferent to site_ruby installation? Can we finally all say "f@#k setup.rb"? Can I discontinue my maintenance of the setup.rb code base? Can I now feel free to use relative require and RDoc-like <code>discover.rb</code>'s to my joyous hearts abandon?

I wonder, is this kind of thing occurring in other language domains too, such as Perl, Python and Rebol? It would appear so. I recently learned, as one might expect, that the guys over at GoboLinux are on the forefront of this. Check out the article, [An overview of /System/Aliens](http://mwh.geek.nz/2009/07/23/an-overview-of-systemaliens/).

Is the revolt under way?

