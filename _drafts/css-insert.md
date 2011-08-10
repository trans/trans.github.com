---
title  : CSS Insert
author : trans
tags   : css
date   : 2009-06-30

--- markdown

I imagine every web designer has, at one point or another, wondered why HTML does not support some means of HTML insertion. You can find numerous hacks to provide this capability such as [Apache](http://www.apache.org/) [Server Side Includes](http://httpd.apache.org/docs/1.3/howto/ssi.html), AJAX solutions such as [jQuery](http://jquery.com)'s <code>$.load</code>, scripting solutions like [PHP](http://php.org/)'s <code>include()</code>, and even middle-ware like [Jaxer](http://www.aptana.com/jaxer/) with it's <code>jaxer:insert</code> tag. With so much demand, you really have to wonder that the HTML designers were thinking when the *purposefully* ignored this obvious feature. I can only imagine that some strange *ideology* won out. Quite frankly we have way too many theoreticians putting these standards together and not enough practitioners. Case in point, I asked about this topic once on a W3C mailing list and was quickly told to use XML and XSLT, which btw, I have tried, and found it ten times more complicated then using most of the aforementioned hacks.

In [recent posts](http://tigerops.org/2009/02/xml-css.html) I have been thinking about using CSS for more than it's original purpose as a "stylesheet" to mean something broader and more useful, namely "semantic structure". In other words, the HTML would specify only the *what* and the CSS would specify **all** of the *how*. I think this is best approach for the future of web standards as it creates very good SOC (Separation Of Concern).

Interestingly, it occurs to me that this could <em>potentially</em> mean that HTML inserts should not be done in the markup at all, but rather in the CSS. Consider this simple pseudo example in Jaxer:

--- coderay.html

  <html>
  <body>
    <jaxer:insert src="header.html"/>
    Content of said webpage.
    <jaxer:insert src="footer.html"/>
  </body>
  </html>

--- markdown

It is clear enough what the intention of this is even if you have never used Jaxer. Clearly this example is mixing content with structure. Using a CSS Insert instead (if CSS could do such a thing) we might have:

--- coderay.html

  <html>
  <body>
    <span id="header"/>
    Content of said webpage.
    <span id="footer"/>
  </body>
  </html>

--- coderay.css

  #header{
    insert: url(header.html)
  }
  #footer{
    insert: url(footer.html)
  }

--- markdown

Taking it one step further, <a href="http://tigerops.org/?p=80">per my last post</a>, our "HTML"  can become XML:

--- coderay.html

  <html>
  <body>
    <header/>
    Content of said webpage.
    <footer/>
  </body>
  </html>

--- coderay.css

  header{
    insert: url(header.html)
  }
  footer{
    insert: url(footer.html)
  }

--- markdown

CSS Inserts could be a very powerful tool. For example, changing the class of a <code>div</code> that has an insert style, rather than using an AJAX load. It would be interesting to explore the full potential of this idea --and it's downsides. At the very least, it is clear that it would effectively allow us to work with HTML in much the same way as we can currently work with images in our CSS.

