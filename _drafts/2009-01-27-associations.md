---
title    : Associations
author   : trans
category : ruby
date     : 2009-01-27

---

A spin-off of Ruby Facets...

For this edition of our exploration of <a href="facets.rubyforge.org">Ruby Facets</a> we'll look at something a bit unconventional. As many of you may already be aware all of the libraries in Facets are divided into three groups. The CORE library houses all the extensions to Ruby's core classes; the LORE library (the most recent division) is a funny name for extensions to Ruby's standard library; and the MORE library is a collection of original additions. In the MORE library you will find a script called, *association.rb*.

--- coderay.ruby

  require 'facets/association.rb'

--- markdown

This script provides a class called, obviously enough, <code>Association</code>, which can be used to create generic one-way associations between objects, i.e. allowing one object to be associated with another. It has a variety of uses, such as link-lists, ordered maps and mixed collections.

While one can use Association.new to draw these associations, they can be drawn more conveniently using the +>>+ operator.

--- coderay.ruby

  :Apple >> :Fruit
  :Apple >> :Red

--- markdown

We can see the associations that have been drawn by calling the #associations method on the object in question.</p>

--- coderay.ruby

  :Apple.associations   #=> [ :Fruit, :Red ]

--- markdown

That's really all there is to associations. Beyond this is simply a matter of how to put them to good use. For example, one interesting use is in arrays to make simple lists of ordered pairs.

--- coderay.ruby

  c = [ :a >> 1, :b >> 2 ]
  c.each { |k,v| p "#{k} is associated with #{v}" }

--- markdown

produces

--- coderay.ruby

  "a is associated with 1"
  "b is associated with 2"

--- markdown

There is one caveat to using association.rb. Since it defines the <code>#&gt;&gt;</code> operator universally, one needs to be mindful of areas in which it may conflict with other definitions. Generally this is not an issue because <code>#&gt;&gt;</code> is a rarely used method. But, for instance, you can't use it for any of the following classes because they use <code>#&gt;&gt;</code> for other things.

--- coderay.ruby

  Bignum
  Fixnum
  Date
  IPAddr
  Process::Status

--- markdown

When there is this potential for a conflict, you can always fall back to using <code>Association.new</code>. Unfortunately, it is this caveat that makes this library unconventional. If it were otherwise, I believe Associations could be a much more widely used class.

And that brings to the reason I choice the association.rb library for this edition. I would like to get feedback on ways to improve the implementation. My main concerns are 1) should object have one single association, or handle multiple associations as they do now; 2) how best to store these relationships, eg. globalb variable or class variable, &c.; and 3) how best to notate them so they are convenient to define but unobtrusive, something #>> is not.

