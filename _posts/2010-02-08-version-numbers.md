---
title      : Damn Version Numbers
author     : Trans
date       : 2010-02-08
categories : [versions, scm, development]
layout     : post
---

Per the usual for a developer with too many projects on their hands,
I am constantly on the lookout for new tools to make my work easier.
Being the kind of person who likes to "do it themselves", I often
end-up writing those tools. Recently I endeavored to make my life a bit
easier by automating, at least in part, my project's version numbers.
I thought, while only a partial help, that if I added a git post-commit
hook that bumped the patch number one, at the very least I could push
out patches without ever having to fuss with adjusting the version
number manually.

<a href="http://book.git-scm.com/5_git_hooks.html">Git hooks</a>,
by the way, are a cinch to setup. Just edit the
<tt>.git/hooks/xxx</tt> script and turn on its user-executable
permission. As difficult as <tt>git</tt> itself can be to use at times,
this was about as easy as it could get --Developer's Hog Heaven.

Of course, I overlooked the simple fact that changing my project's
version file would itself need to be committed b/c it is also tracked
by the version control system, which would in turn invoke the hook,
modifying the version and requiring yet another commit, ad infinitum.
This wasn't going to work. Crap!

Yet, that little snafu really got the old brain juices flowing and
my fingers blogging. I want to make versioning my projects as simple as
Git's hooks are to create. Ultra-low maintenance and in need of barely
any consideration. Is it possible? I then thought about Ubuntu's
versioning policy. Now there's a low maintenance system! Just use the
release date. I like it. But... it doesn't tell you anything about the
release. Is it a major release? A minor release? Merely a bug fix?
Or a security fix? There's no way to tell. And consequently there is no
way to effect one's dependencies to use only a limited set versions per a
"<a href="http://docs.rubygems.org/read/chapter/7">rational versioning policy</a>".

But wait a minute. What about these newfangled ".a" for alpha,
".b" for beta, indicators that <a href="http://docs.rubygems.org/">RubyGems</a>
recently introduced? Aren't they a means communicating some fact about
the release? And yet are they really version numbers? They attempt
to emulate them by being single letters --sure we can enumerate by
letters just as well as numbers, but isn't that a shoe-horn --squeezing
information into a version "look alike" of sorts? And that being
the case, then hell with it, why not just do the whole version
scheme the same way.

To that end I propose we consider a new way to version, patterned
after date versions, a la Ubuntu, and augmented with informational
letter tags to tell us what kind of release with which we are dealing.
Let's consider some possible examples.

```html
<pre>
   10.01.04      # major release
   10.01.05-m    # minor interface changes from previous release
   10.01.06-p    # patch release / bug fix to previous release
   10.02.11-s    # security fix to previous version
   10.04.06-a    # alpha release of next major version
   10.09.21-b    # beta release of next major version
</pre>
```

That's a refreshingly simple scheme. All we would have to manually
specify at release time is the type via a single letter, the dating
is easily automated. (Note, I used a dash for no other reason than
it looked good to my eye. A dot could be used, or even nothing at
all. I really don't care what provides the delimitation myself.)

Granted, this version scheme doesn't tell us how many major releases or
minor releases or patch releases have been made since the project's inception.
But we don't really need to know that (and if we do we can just program our
package managers to run a summation). What we really need to know is simply
if there is a newer version than our current version, that it is a security fix,
or a minor update, or a major update, and so on, depending on our choice of
significance. Indeed I would even suggest that perhaps we add a some additional
types to help clarify further the type of release.

