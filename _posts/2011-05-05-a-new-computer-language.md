---
title      : A New Programming Language
author     : trans
categories : [ruby, programming]
date       : 2011-05-05
published  : false
---

I find the current state of programming still extensively primative. In many
ways we have spent the first 50 years of the computer revolution conforming
to computers. This was initially necessary, but now has become increasingly
cumbersome. This is true for many aspects of the computing environment, even
those focused on graphical-user-interfaces. But it is most apparent in
programming itself.

[Fill in examples of primative practices]
* static typing
* memory management

## Example

I believe in *examples first*. Here is the first part of an example
program to play flash cards.

    = FlashCards
    by Mr. Smith

    The game of Flash Cards is very simple. It requires a deck of 
    picture cards. Each card has a picture on the back of the card
    and a word on the face of the card. The dealer takes a card
    and shows the back of the card to the player. The player then
    trys to guess the word on the face of the card based on the 
    image as shown on the back. The player gets a point for every
    correct answer. A winning player is one who gets 99% of the
    questions correct. The dealer places the card is the discard pile.
    
Believe it or not that is part of the program. We might refer to it as
the *semantic specification* of the problem set.

The next layer is the *procedural scheduling*. This is written with a simple
DSL over a procedural language, such as Ruby, Javascript or forth++.

```ruby
  When "requires a deck of cards" do
     cards = Hash[*%{! 1 @ 2 # 3 $ 4 % 5 ^ 6 & 7 * 8 ( 9 ) 0}]
    @cards = cards.map{ |k,v| Card.new(k,v) }
  end

  class Card
    attr :face
    attr :back
    def initialize(face, back)
      @face, @back = face, back
    end
    def match?(guess)
      guess == back
    end
  end
```

The procedural scheduling consists a set of match rules. As the the
semantic sepcification is read-in, it triggers events in the procedural
schedule. The first event we address is the dealing of the cards. In doing
this we determine we should use a specilized object for each card, and
so create a Card class.

Lets continue...

```ruby
  When "dealer takes a card" do
    if @cards.empty?
      @cards = @discard_pile.shuffle
    end
    @dealers_card = @cards.pop
  end

  When "shows the back of the card" do
    print "#{@dealers_card} ?"
  end

  When "trys to guess" do
    ans = ask
    if ans == @dealers_card.match(ans)
      @right ||= 0
      @right += 1
    else
      @wrong ||= 0
      @wrong += 1
    end
  end

  When "winning player is one who gets 99%" do
    if 0.99 == (@right / @right + @wrong)
      puts "You Win!"
      exit
    else
      goto "dealer takes a card"
    end
  end

  When "places the card is the discard pile" do
    @discard_pile ||= []
    @discard_pile << @dealers_card
  end
```

We are not quite finished yet, but we are far enough along to really
demonstrate the magic of this approach --and after all are a'mamatter
first appears here: `goto`.

As the "reading" of the semantic specification proceeds, various events
are triggered which bring the program fruition.

As we continue to refactor our program some amazing properties of this appraoch
become appeartant. We can see where procedures tend to get large. most often 
just a few lines of code is all that each procedure needs. If we have more
than this it is a good indication that a new procedure can be spun off
for that bit of code which in turn needs to be written about in the semantic 
specification.

## Contexts

Of course all these procedures would do us little good if we could not
easily share them. To this end we use a module system. Procedures
are grouped together and named, which can then be included into a 
programs context.

## Testing

Testing becomes the seemingly redundant activity of writing about the 
writing. But it is important for solid program construction. Think of it
as double entry accounting.

    # Test 

    test "winning player is one who gets 99%" do |right, wrong|
      @right = right
      @wrong = wrong
      
    end

## SIDE NOTES

Combine premptive execution via in program hints (ruby lib?) with a strong 
isolation.

