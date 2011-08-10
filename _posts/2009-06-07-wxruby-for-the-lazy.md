---
title      : WxRuby for the Lazy
author     : trans
categories : [ruby, gui]
date       : 2009-06-07
---

[WxRuby](http://wxruby.rubyforge.org/wiki/wiki.pl) is probably the best overall GUI library for Ruby currently available. It is cross-platform, provides native look-and-feel and is stable enough for production use. All other GUI libraries, despite their various merits, fall short in at least one of the areas. However, WxRuby does have one major downfall. It is pretty much a straight port of the C API. Writing WxRuby code is largely the same as writing actual WxWidgets C code. It's far from the "Ruby Way".

So how did I mange to get fairly nice Ruby code despite a binding that is essentially a straight port of the underlying C API? I built it from the bottom-up using a lazy coding technique. And I mean "bottom-up" literally --the following code might actually be easier to read if you start from the bottom and work your way up to the top. The trick is to break down one's interface into individual widgets and create an instance method for each using the <code>||=</code> memoization trick. 

You can see from the following code I was able to apply this "trick" to everything but toolbar buttons (aka 'tools'). This is because the toolbar itself is needed to create them. So I simply defined attributes for each tool, but actually created the tool buttons in the toolbar's method. Have a look.

```html
<!-- [gist id="182301"] -->
<script src="http://gist.github.com/182301.js"></script>
```

The thing to notice, if you haven't caught it yet, is how calling <code>#search_toolbar</code> leads to calling <code>#search_sizer</code> which in turn leads to calling <code>#search_panel</code>, and so forth all the way to the top <code>#frame_panel</code>. This code is a striped down version of actual code I am using. I hope it helps others create wxRuby application more easily. As I said in my previous post, I found in mind-numbingly difficult to create WxRuby interfaces until I worked out this approach. WxRuby is still a difficult API to master, but this technique makes the effort more manageable, and therefore more likely to succeed. 

For another example of building structures lazily, have a look at <a href="http://blade.nagaokaut.ac.jp/cgi-bin/scat.rb/ruby/ruby-talk/122593">my solution</a> for <a href="http://rubyquiz.com/quiz10.html">Ruby Quiz 10 - Crosswords</a>.

