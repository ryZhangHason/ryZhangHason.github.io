#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("..", __dir__)
BIBTEX_DIR = File.join(ROOT, "_bibtex")
OUTPUT_PATH = File.join(ROOT, "_data", "generated_apa.yml")

def normalize_text(text)
  text.to_s.gsub(/\s+/, " ").strip
end

def strip_outer_wrappers(value)
  output = normalize_text(value)

  loop do
    wrapped_in_braces = output.start_with?("{") && output.end_with?("}")
    wrapped_in_quotes = output.start_with?('"') && output.end_with?('"')
    break unless output.length > 1 && (wrapped_in_braces || wrapped_in_quotes)

    output = output[1..-2].strip
  end

  output.delete("{}")
end

def split_bibtex_fields(body)
  fields = []
  current = +""
  depth = 0
  in_quotes = false

  body.each_char.with_index do |char, index|
    in_quotes = !in_quotes if char == '"' && body[index - 1] != "\\"

    unless in_quotes
      depth += 1 if char == "{"
      depth -= 1 if char == "}" && depth.positive?
    end

    if char == "," && depth.zero? && !in_quotes
      fields << current if normalize_text(current) != ""
      current = +""
    else
      current << char
    end
  end

  fields << current if normalize_text(current) != ""
  fields
end

def parse_bibtex_entry(bibtex)
  normalized = normalize_text(bibtex)
  type_match = normalized.match(/^@([a-zA-Z]+)\s*\{/)
  return nil unless type_match

  first_comma = normalized.index(",")
  last_brace = normalized.rindex("}")
  return nil unless first_comma && last_brace && last_brace > first_comma

  body = normalized[(first_comma + 1)...last_brace]
  fields = {}

  split_bibtex_fields(body).each do |field|
    separator_index = field.index("=")
    next unless separator_index

    name = normalize_text(field[0...separator_index]).downcase
    value = strip_outer_wrappers(field[(separator_index + 1)..])
    fields[name] = value unless name.empty?
  end

  { type: type_match[1].downcase, fields: fields }
end

def split_authors(author_field)
  normalize_text(author_field).split(/\s+and\s+/i).map { |author| normalize_text(author) }.reject(&:empty?)
end

def format_author(author)
  if author.include?(",")
    family, given = author.split(",", 2).map { |part| normalize_text(part) }
  else
    parts = author.split(/\s+/)
    family = parts.pop.to_s
    given = parts.join(" ")
  end

  initials = given.split(/\s+/).reject(&:empty?).map do |part|
    part.split("-").map { |sub| sub.empty? ? "" : "#{sub[0].upcase}." }.join("-")
  end.join(" ")

  initials.empty? ? family : "#{family}, #{initials}"
end

def format_authors(author_field)
  authors = split_authors(author_field).map { |author| format_author(author) }
  return "" if authors.empty?
  return authors.first if authors.length == 1
  return "#{authors[0]} & #{authors[1]}" if authors.length == 2

  "#{authors[0...-1].join(', ')}, & #{authors[-1]}"
end

def sentence_case_title(title)
  trimmed = normalize_text(title)
  return "" if trimmed.empty?

  trimmed[0].upcase + trimmed[1..].to_s
end

def bibtex_to_apa(bibtex)
  entry = parse_bibtex_entry(bibtex)
  return "" unless entry

  fields = entry[:fields]
  authors = format_authors(fields["author"] || "")
  year = fields["year"] ? "(#{fields['year']})." : "(n.d.)."
  title = sentence_case_title(fields["title"] || "")

  source_parts = []
  source_parts << fields["journal"] if fields["journal"]
  source_parts << fields["booktitle"] if !fields["journal"] && fields["booktitle"]
  source_parts << fields["publisher"] if source_parts.empty? && fields["publisher"]

  volume_number = +""
  volume_number << fields["volume"].to_s if fields["volume"]
  volume_number << "(#{fields['number']})" if fields["number"]
  source_parts << volume_number unless volume_number.empty?
  source_parts << "#{fields['pages']}." if fields["pages"]

  url =
    if fields["doi"]
      "https://doi.org/#{fields['doi'].sub(%r{^https?://doi\.org/}i, '')}"
    elsif fields["url"]
      fields["url"]
    elsif fields["eprint"] && fields["archiveprefix"].to_s.match?(/arxiv/i)
      "https://arxiv.org/abs/#{fields['eprint'].sub(/^arxiv:/i, '')}"
    end

  normalize_text([
    authors,
    year,
    (title.empty? ? nil : "#{title}."),
    (source_parts.empty? ? nil : source_parts.join(", ")),
    url
  ].compact.join(" "))
end

def extract_frontmatter_key(content)
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  return [nil, content] unless match

  frontmatter = YAML.safe_load(match[1], permitted_classes: [], aliases: false) || {}
  [frontmatter["key"], content.sub(match[0], "")]
end

output = {}

Dir.glob(File.join(BIBTEX_DIR, "*.md")).sort.each do |path|
  content = File.read(path)
  key, bibtex = extract_frontmatter_key(content)
  next if key.nil? || bibtex.strip.empty?

  output[key] = bibtex_to_apa(bibtex)
end

File.write(OUTPUT_PATH, output.to_yaml)
