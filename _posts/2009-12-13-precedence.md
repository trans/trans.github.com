---
title      : A Failure of Precedence
author     : trans
categories : [website]
date       : 2009-12-13
layout     : post
---

# Ruby's Operator Precedence Can Be Improved

There's a lot to love about Ruby. Most of us know well the many great advantages it provides, as they say, "making programming fun". However, Ruby is also notoriously dogged by a few small gotchas and inconsistancies. Some of these are understandable, such as the [Double Inclusion Problem](http://eigenclass.org/hiki/The+double+inclusion+problem); issues that are not worth the extensive effort to fix. On the other hand, some simple issues doggedly persist for little good reason (backward compatibility not withstanding).

One of these issues is operator precedence. Not only is operator precedence set in stone, it is also
woefully <i>bottom heavy</i> --there is only one binary operator available for use above the common arthmetic operations.

Here is the table as given by the [PickAxe](https://www.cs.auckland.ac.nz/references/ruby/ProgrammingRuby/language.html):


    Method    Operator                Description
    Y         [ ] [ ]=                Element reference, element set
    Y         **                      Exponentiation
    Y         ! ~ + -                 Not, complement, unary plus and minus (method names for the last two are +@ and -@)
    Y         * / %                   Multiply, divide, and modulo
    Y         + -                     Plus and minus
    Y         >> <<                   Right and left shift
    Y         &                       Bitwise `and'
    Y         ^ |                     Bitwise exclusive `or' and regular `or'
    Y         <= < > >=               Comparison operators
    Y         <=> == === != =~ !~     Equality and pattern match operators (!= and !~ may not be defined as methods)
              &&                      Logical `and'
              ||                      Logical `or'
              .. ...                  Range (inclusive and exclusive)
	            ? :                     Ternary if-then-else
              = %= { /= -= += |= &=   Assignment
              >>= <<= *= &&= ||= **=   
              defined?                Check if symbol defined
              not                     Logical negation
              or and                  Logical composition
              if unless while until   Expression modifiers
              begin/end               Block expression

The lack of any operators other then <tt>\*\*</tt>, above the most commonly used, <tt>* / % + -</tt>, puts
a frustrating limitation on the flexibility of this system. On this account, the most puzzling misplacement of an operator
has to be Bitwise Exlusive Or, <tt>^</tt>. In many, if not most, programming languages <tt>^</tt> is the power operator.
But in Ruby that function is delegated to <tt>\*\*</tt>. While I personally do not favor <tt>\*\*</tt> for the use,
it's not something I mind either. However, that <tt>^</tt> doesn't share the same precedence is very awkward.

Consider for instance, the implementation of a unit system.

    2.meters ** 2  => "4 square meters"

Notice the power operator effects the unit and the value. So how would we go about notating <code>2 square meters</code>?
We need some other means. The obvious answer is to redefine <tt>^</tt>:

    2.meters ^ 2  => "2 square meters"

Great. But wait, there is an ugliness now upon us.

    2.meters ^ 2 / 2  => "2 meters"

The answer should have been <tt>1 square meter</tt>, but due to precedence <tt>2 / 2</tt> is barring a <tt>1</tt> before the <tt>^</tt> power operator kicks-in.

It is truly wonderful that Ruby's first 27 operators are actually methods, which means they can be defined to perform whatever
function we would like of them. But despite being able to define these operators, there is no means of changing their
precedence. Thus, the actual options we have defining new operations to suite our needs are hindered.

Ideally we would be able to alter precedence on a per-class basis. While, some might argue that would create too much confusion,
I would retort that good libraries would use the feature effectively, limiting the changes to the appropriate use-cases, so that
it would not be an issue. After all, a library that scrambles precedence for no damn good reason will get little use.

While we wait the day of true precedence freedom, I would like to see Ruby move <tt>^</tt> up with <tt>**</tt> and find a new
Exclusive Or operator. Backward compatibility can be largely, although not completely, preserved by aliasing <tt>^</tt>
to the new symbol. It's an obvious and simple improvement --a naggling issue that has been around for quite some time.
