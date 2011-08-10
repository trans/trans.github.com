---
title      : Mocking Mocks
author     : Trans
date       : 2010-02-14
categories : [tdd, bdd, test, mock]
layout     : post
---

There are a variety of test-double/mocking libraries available for Ruby.
[Mocha](http://mocha.rubyforge.org/) is probably the most well known.
[RSpec](http://rspec.info/) comes with it's own mock library. I beleive
[FlexMock](http://flexmock.rubyforge.org/) is the venerable older gentleman
on the block. And there are plenty of alternatives such as
[rr](http://rubyforge.org/projects/double-ruby) and [stump](http://github.com/jm/stump).

I myself have been toying with an implementation, with a goal of maximizing ease
of use and implemetation overhead. In my pursuit I discovered something very
interesting: Ruby doesn't necessairly need a test-double library.

Consider the case of a pure *stub*. Ruby's Struct class makes pure stubs 
ridiculously easy.

```ruby
  stub = Struct.new(:to_s).new("Hello, World!")
  stub.to_s #=> "Hello, World!"
```

And because Struct.new returns a class, they can be reused, adjusted and 
inherited, like any other Ruby class --pretty sweet.

How about the case of a *partial stubs*. Since Ruby supports singleton methods,
it is a simple matter of latching a new or overriding method onto an object.

```ruby
  obj = "my object"

  def obj.to_s
    "mocking " + super
  end
```

I mean, how easy can it get? 

Ok. So stubs are easy, but how about *mocks*? Well, let's first consider what I
call *light-weight mocks*. These are like mocks in that the set-up conditions
on message invocations, but unlike regular mocks they are triggered during
invocation rather than awaiting a special trigger method (eg. `#verify`). Again,
these are easy in Ruby. (Note: I am using the [AE](http://proutils.github.com/ae)
library for my assertions syntax.)

```ruby
  obj = "my object"

  def obj.to_s
    result = super
    result.assert =~ /^my/
    result
  end

  obj.to_s
```

I would argue in most cases light-weight mocks are more than sufficient for most
testing needs. Regular mocks have a tendency to become too enmeshed in implementation,
which creates undo maintenance headaches. Nonetheless, bare with me and we 
we see how to do regular mocks in pure Ruby as well.

Before we get to regular mocks we first need to consider the test *spy*. Check it out.
We will use one simple helper from Ruby Facets, called Functor.

```ruby
  require 'facets/functor'
```

If you are wondering, the functor is nothing more than a BasicObject that redirects
`#missing_method` calls to the block you supply it.

```ruby
  obj = "my object"

  rec = []

  spy = Functor.new do |op, *a, &b|
    r = obj.send(op, *a, &b)
    rec << [op, a, b, r]
    r
  end

  spy.to_s
```

All we are doing here is intercepting the calls to `obj` by delegating through `spy`.
A record of activity is then being stored in the `rec` array. With it we can
verify, for instance, that `#to_s` was called.

```ruby
  msg = rec.find{ |op, a, b, r| op == :to_s }
  assert(msg)
```

And that it returned what was expected.

```ruby
  assert(msg.last == "my object")
```

Or we can even verify how many times it was called. Lets call it two more times
to be sure.

```ruby
  spy.to_s
  spy.to_s

  assert(rec.map{ |op, *x| op }.count(:to_s) == 3)
```

A little verbose, but nothing too terribly strenuous to understand.

Alright. So now lets turn to full-fledge *mocks*. As you might have
suspected, mocks are a trivial derivation of spies. All we need to do
is collect our verifications together on a per-method bases and run
through them subsequent to invocations in question.

First lets reset our target object and spy.

```ruby
  obj = "my object"

  rec = []

  spy = Functor.new do |op, *a, &b|
    r = obj.send(op, *a, &b)
    rec << [op, a, b, r]
    r
  end
```

We will store out verifications in a Hash.

```ruby
  verify = Hash.new{ |h,k| h[k]=[] }
```

We define our verification procedures.

```ruby
  verify[:to_s] = lambda do |recs| 
    recs.first.last.assert == "my object"
    recs.count.assert == 1
  end
```

Now we can execute the code in question.

```ruby
  spy.to_s
```

And verify by iterating over and calling each verification procedure.

```ruby
  verify.each do |vop, tst|
    recs = rec.select{ |op, a, b, r| vop == op }
    tst.call(recs)
  end
```

Granted that by the time we get to mocks, the code has gotten a little
more complex and certainly not as pretty as a dedicated mock library.
Nonetheless, what is remarkable here is that it takes so little to get
so much out of Ruby. With a few helper methods wrapping some of the
above code segments we would hardly know we weren't working with
a full-fledged mocking library.

Moreover as I argued above, one rarely needs to go this far to get
perfectly good test-doubles. Light-weight mocks will cover most
contingencies just as well as their full-fledged brethren without
the worry of taking your tests too far into the realm of implementation
detail.

