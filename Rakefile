require 'fileutils'

DIRS = [ 'Adobe Illustrator CC 2014',  
         'Adobe Illustrator CC',      
         'Adobe Illustrator CS5',
         'Adobe Illustrator CS4',
         'Adobe Illustrator CS3' ]

task :install do 
  DIRS.each do |dir|
    install_dir =  "/Applications/#{dir}/Presets.localized/en_US/Scripts" 

    puts "\n----\nChecking for existence of #{install_dir}"
    if Dir.exist?( install_dir )
      puts "Found it. Installing"
      cp "ai2html.jsx", "#{install_dir}/ai2html.jsx"
    else
      puts "Does not exist."
    end
  end
end
