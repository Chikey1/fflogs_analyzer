require 'nokogiri'
require 'pry'
require 'open-uri'
require 'rb-readline'
require "net/https"
require "uri"


class FflogsParser
  def initialize(report)
    # "QwCLXKp8kqHyNnfd"
    @report = report
  end

  def start
    url = "https://www.fflogs.com/v1/report/fights/#{@report}?api_key=7ffe75b93491065c218baa9ece0d641d"
    uri = URI(url)
    response = Net::HTTP.get(uri)
    json = JSON.parse(response)

    fights = get_fights(name: "The Ultima Weapon", json: json)
    fight_lengths = fights.map do |fight|
      get_pull_length(fight)
    end

    median = get_median_pull(fight_lengths)
    max = fight_lengths.max
    total_time = fight_lengths.sum

    puts "total time: #{format_time(total_time)}"
    puts "pulls: #{fights.length}"
    puts "longest pull: #{format_time(max)}"
    puts "median pull: #{format_time(median)}"
  end

private
  def format_time(sec)
    min = sec / 60
    hours = (min / 60).floor
    sec = (sec % 60).round
    min = (min % 60).floor

    return hours > 0 ? "#{hours}:#{min}:#{sec}" : "#{min}:#{sec}"
  end

  def get_median_pull(fight_lengths)
    fights = fight_lengths.sort

    if fights.length % 2 # odd
      middle = fight_lengths.length/2

      return fights[middle]
    else # even
      middle_right = fight_lengths.length/2
      middle_left = middle_right - 1

      return (fights[middle_left] + fights[middle_right])/2
    end
  end

  def get_fights(name: nil, json:)
    fights = json["fights"]
    return fights if name.nil?

    fights.filter do |fight|
      fight["name"] == name
    end
  end

  def get_pull_length(fight)
    start_time = Time.at(fight["start_time"])
    end_time = Time.at(fight["end_time"])

    milliseconds = end_time - start_time

    # seconds
    return milliseconds / 1000
  end
end

# irb
# require './fflogs_parser.rb'
