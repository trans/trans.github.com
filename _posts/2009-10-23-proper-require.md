---
title      : A Proper Require
author     : trans
categories : [ruby, require]
date       : 2009-10-23
---

Recently I [posted](http://groups.google.com/group/ruby-talk-google/browse_thread/thread/6a46c837ffc84761)
a light diatribe against improper use of relative requires in Ruby programs.
I pointed-out a bit of code, I recently came across, that added a relative path to Ruby's
<code>$LOAD_PATH</code> from within a <code>bin/</code> executable.

```ruby
  $LOAD_PATH.unshift(File.expand_path(File.dirname(__FILE__) + "/../lib"))
```

I suspect the author little realized that his program would not function if it were installed
according to traditional [FHS](http://www.pathname.com/fhs/)-based standards. And I fear many
young Rubyists, having known nothing but the use of RubyGems and/or deployment (as opposed to release)
of Rails apps, do not understand the nature of the issue. In my post I stated some general rules.

## The Rules of Relative Loading

* Don't mess with the <code>$LOAD_PATH</code>.
* Use relative lookup only when you must, eg. using bundled HTML templates.
* Any relative paths you do use must remain within the confines of their main directory (eg. lib/)
* Don't use a relative lookup for any .rb or .so/.dll loading.
* It should never be necessary to require 'rubygems'.

[James Edward Gray II](http://blog.grayproductions.net/) pointed out that
I had not been clear in stating the exceptions to these rules, so I add the
following.

## When the Rules Do *Not* Apply

* They do not apply to Rails Apps since they are deployed, rather than packaged and installed.
* Testing and building scripts are free from the rules since they are localized operations.

Even when the rules do not apply, try to adhear to them as much as possible. For exmaple, minimize
the points of entry. At the very least it can benefit refactoring.

## Understanding the Rules

Most of the responses to my post expressed understanding of the last rule, as there have been a few
write-ups on that subject before. But many could not understand the reasons behind the other points.
And it's no wonder. I did some research and discovered there to be a fair bit of misinformation
circulating promoting the use of relative loading as a "proper" solution, and very little information
explaining what is actually best practice.

It was the last reply to my post that made me realize I should take a moment to write this 
blog entry to more fully explain.

<blockquote>
"As someone who wrote a dependency-resolving code loading gem, I am extremely
dubious that one can always avoid code loading using relative paths.
How would you ordinarily go about loading some .rb files in a subdirectory
beneath the directory in which the current file is located?"
</blockquote>

Clearly we have a quite capable programmer here, having written "a dependency-resolving code loading gem",
but the fact the he states that he wrote a "gem" rather then a "library" struck me as an indication
that some crucial old school knowledge is missing from his repertoire that inevitably lead him to
his second sentence.

The key, I believe, to alleviating this misunderstanding is Minero Aoki's [Setup.rb](http://i.loveruby.net/en/projects/setup/).
Before we had RubyGems, Aoki's <code>setup.rb</code> script was *the* way to install Ruby software, and his
work helped lay the foundation for the way in which Ruby projects are structured to this very day. The
first two sections of the Setup.rb [documentation](http://i.loveruby.net/en/projects/setup/doc/)
should be required reading for all Rubyists.

Once we understand how Setup.rb works --where it puts a project's files upon installation, we can
then understand when we can and when we cannot get away with using relative requires. However, even
when we can do so, it does not mean we should. The idea of Setup.rb is to install your files
into the system locations where the <code>$LOAD_PATH</code> is already set to look. In other words,
you should not effect the <code>$LOAD_PATH</code> in your code, but make sure your code is where
the <code>$LOAD_PATH</code> expects it to be. The <code>$LOAD_PATH</code> is something managed externally,
by a system administrator, or a specially designed program for just such a purpose (like RubyGems).
By placing our code in the correct system locations, we will only ever need standard 
<code>require 'mylib/mysubdir/myfile'</code> type load calls.

## How to Follow the Rules

So how do we make sure our code is where it needs to be? In the old days we just used <code>setup.rb</code>.
By following it's conventions and installing our software with it, all was well. But today most Rubyists
use RubyGems. That works just as well, but there are two configuration issues that attend it's use.

1. Our project's gemspec must have the proper <code>require_paths</code> setting. The default is the setup.rb standard <code>lib/</code>.
2. Our RUBYOPT environment setting must contain "-rubygems".

As I mentioned in the above bullet points, it is okay to add to the <code>$LOAD_PATH</code> when running
tests --that's essential to avoid having to reinstall your project after every code change. But it's not
acceptable to do so in your actual program.

I believe Minero Aoki has completed his work on Setup.rb, as there has not been any activity on his project
in some time. A while ago, I [forked Setup.rb](http://github.com/proutils/setup) in order to make it a stand-alone
package that can be installed via RubyGems. Since then I have continued it's development, working on few
aspects of the system such as using optparse.rb for command-line parsing, removing the (unused) multi-package
feature, adding doc/ installation and most recenty I started to rewrite the install code to be atomic
(would love some assistance on that, btw!).

With the advent of RubyGems, <code>setup.rb</code> is not as widely needed as it once was (though it still gets
used in some cases). Yet the ground work it laid is still with us, and should be understood if one wishes to
be an effective Ruby programmer.

