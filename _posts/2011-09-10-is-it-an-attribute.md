# Is It An Attribute?

What exactly is an attribute? In OOP a Ruby attribute is what is generally
referred to as an <i>accessor method</i>. An accessor method is a means of
direct access to an object's underlying state. In other words, it is a method
for direct access to instance variables. And that is exactly what Ruby's helper
class methods (`attr`, `attr_reader`, `attr_writer` and `attr_accessor`)
create.

However, Ruby's "accessor methods" are not a specially recognized methods, 
like *properties* are in Javascript. Rather Ruby simply creates regular
old methods which internally work with the instance variables. This fact,
leads to a bit of puzzlement. If attributes are Ruby's means for creating 
accessor methods, but attributes are only a short-cut for creating regular
methods, when is a method an attribute or not an attribute?  For instance:

    class Foo
      def x; @x; end
    end

Is `#x` an attribute in this example, since it results in the exact same 
class definition as:

    class Foo
      attr :x
    end

It would seem to be, but neither RDoc or YARD will document it as such, even though
both list "attributes" for the class.

Going a step further, if the later definition is an attribute, which is an accessor
method, what the is:

    class Foo
      def x; @x.to_s; end
    end

Does the addition of #to_s invalidate #x as an accessor and thus as an attribute?
Is that so even if @x is supposed to be a string?

More confusing still, since Ruby methods can be rewritten at any time there is the 
opposite possibility that what appears as an attribute is not actually an accessor
method as all. Experienced Rubyists know that Ruby issues a warning when a method
overwrites another method --even one created via an `attr` method. But it's just
a warning and really a minor one at that. This can cause some very basic
confusion if an attribute is overwritten by a method that does not simply access
the object's state. 

Ruby's common documentation tools make this issue very easy to see. Take a class
defined as follows:

    class IsItAnAttribute
      # Attribute accessor #foo.
      attr_accessor :foo

      # Attribute reader #foo.
      attr_reader :bar

      # Attribute writer #foo.
      attr_writer :baz

      # Method #foo.
      def foo
        @foo + 1
      end

      # Method #foo=.
      def foo=(i)
        @foo = i.to_i - 1
      end

      # Method #bar.
      def bar
      end

      # Method #bar=(i)
      def bar=(i)
        @bar = i
      end

      # Method #baz.
      def baz
        @baz
      end
    end

In the case of <a href="/example/is-it-an-attributes/rdoc/index.html">RDoc</a>,
it lists `bar=`, `baz` and `foo=` as methods, and lists `bar[R]`, `baz[W]`
and `foo[RW]` as attributes. The attributes seem reasonable if one simply
takes it on faith that attribute declarations are accessors regardless of
what the methods might be doing --it's the documentors issue. And maybe that
is all we can reasonably expect. But it odd that #bar is missing from the
method definitions.

In a <a href="/example/is-it-an-attributes/yard/index.html">YARD</a> on the
other hand, also lists `bar`, `baz` and `foo` as attributes, but does not make
it clear if they are readers, writers or both. It also lists `bar`, `baz`
and `foo` as methods, with no indication that writers even exist. YARD has some
attribute related tags but what seems like the proper approach to improve the
situation does nothing new.

  # Method #bar.
  # @attribute r bar
  def bar
  end

And I should add there are no `[view source]` links in this case as well.

So what gives? What really is an attribute? I'm inclined to think we should 
throw out the very concept from Ruby, at least as Ruby now stands. Attributes
are nothing more than a meta-programming device to create methods and it's
impossible to ensure documentation only labels methods that behave as 
accessor methods.

On the other hand, perhaps we should redefine that concept of an attribute,
not as an accessor method, but as any method we want it to be so long as it
accesses an instance variable in some form or fashion (albeit enforcing that
is not strictly possible either).

