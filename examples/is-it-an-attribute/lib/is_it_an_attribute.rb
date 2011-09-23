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
  # @attribute rw bar
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

