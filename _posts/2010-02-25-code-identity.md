---
title      : Code Identity
author     : Trans
categories : [ruby, identity]
date       : 2010-02-25
---

# A Little Fun with Code Generation

A couple of years ago, a 
<a href="http://blade.nagaokaut.ac.jp/cgi-bin/vframe.rb/ruby/ruby-talk/293058?292931-293646+split-mode-vertical">Ruby Quiz</a>
asked us <i>to print "Hello, world!" to standard output using Ruby in atypical fashion.</i>
Being the resolute over-achiever-to-a-fault that I am, I decided to take the proverbial
pie-in-the-sky highroad to metaland. If, I thought, I could define code <i>identities</i>,
akin to the mathematical kind, I should be able to have the computer simply
generate an endless stream of equivalent solutions. Indeed, it turned out that it wasn't
all that hard to code.

```ruby
  class CodeIdentity

    def self.identities
      @identities ||= []
    end

    def self.identity(&block)
      identities << block
    end

    attr_reader   :original
    attr_accessor :alternates

    def initialize(original)
      @original = original
      @alternates = [original]
    end

    def generate(limit=100)
      work  = original.dup
      while(alternates.size < limit) do
        alts = alternates.dup
        size = alternates.size
        alts.each do |alt|
          self.class.identities.each do |identity|
            self.alternates |= [identity[alt]]
            break if alternates.size >= limit
          end
        end
      end
    end

    def show_code
      alternates.each{ |code| puts code }
    end

    def show_output
      alternates.each{ |code| puts run(code) }
    end

    def generate_tests
      require 'test/unit'
      original_run = run(original)
      runner = method(:run)
      testcase = Class.new(Test::Unit::TestCase)
      alternates.each_with_index do |code, index|
        testcase.class_eval do  
          define_method("test_#{index}") do
            assert_equal(original_run, runner[code])
          end
        end
      end
    end

    def run(code)
      so = $stdout
      sio = StringIO.new
      $stdout, $stderr = sio, sio
      eval code, $TOPLEVEL_BINDING
      result = $stdout.string
      $stdout = so
      result
    end

  end
```

You can see from the #generate_tests method I was able to ensure that the results
were indeed equivalent (an interesting strategy in dynamic testing, perhaps
worth further exploration for production code).

After the <code>CodeIdentity</code> class all was required was to apply a little
<i>Brain Power</i> to come up some identities. I came up with a pretty simplistic lot,
just as proof of concept. By following the original email thread, no doubt we can see
their a assuredly an infinite number of possibilities that could be defined.

```ruby
  class CodeIdentity

    identity do |code|
      code.sub(/puts ["](.*)["]/, 'print "\1\n"')
    end

    identity do |code|
      code.sub(/puts ["](.*)["]/, 'printf "%s\n" % ["\1"]')
    end

    identity do |code|
      code.gsub(/["](.*)["]/, '"\1".reverse.reverse')
    end

    identity do |code|
      code.gsub(/['](.*)[']/){ $1.inspect }
    end

    identity do |code|
      code.gsub(/['](.*)[']/){ "#{$1.split(//).inspect}.join('')" }
    end

  end
```

To finish if off I wrote a small command-line interface that allow us to try any
piece of code and generate as many solutions as desired.

```ruby
  if __FILE__ == $0
    require 'optparse'
    cnt = 20
    OptionParser.new do |opt|
      opt.on("-n", "number of solutions"){ |n| cnt = n }
    end.parse!
    if ARGV.last == '-'
      code = ARGF.read
      ARGV.pop
    else
      code = "puts 'Hello World!'"
    end
    cmd = ARGV.first

    scg = CodeIdentity.new(code)
    scg.generate(cnt)

    case cmd
    when 'test'
      scg.generate_tests
    when 'output'
      scg.show_output
    else
      scg.show_code
    end
  end
```

Without any options it works on the old favorite <code>puts 'Hello, World'</code>
and produces 20 solutions. Here's the output:

```ruby
  puts 'Hello, World!'
  puts "Hello, World!"
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!"].join('')
  print "Hello, World!\n"
  printf "%s\n" % ["Hello, World!"]
  puts "Hello, World!".reverse.reverse
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!".reverse.reverse].join('')
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!"].join("")
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!"].join([].join(''))
  print "Hello, World!\n".reverse.reverse
  printf "%s\n" % ["Hello, World!".reverse.reverse]
  printf "%s\n" % ["Hello, World!"].reverse.reverse
  puts "Hello, World!".reverse.reverse.reverse.reverse
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!".reverse.reverse.reverse.reverse].join('')
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!".reverse.reverse].join("")
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!".reverse.reverse].join([].join(''))
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!"].join("".reverse.reverse)
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!"].join([].join(""))
  puts ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d", "!"].join([].join([].join('')))
  print "Hello, World!\n".reverse.reverse.reverse.reverse
```

Very simplistic, but an interesting and fun diversion. Granted others came up with more intriguing 
individual solutions. But I manged to come up with an infinite set of them! ;) 

(The full code is available in <a href="http://gist.github.com/313518">Gist #313518</a>.)

