# Binarizer

## What is it?
This is an in-browser image converter for the Sharp Memory Display LCDs.
It assumes you're using the 400x240 display and allows you to download a data file that's either thresholded or error diffused using the Floyd-Steinberg algotithm.

This was written in Javascript using the P5js framework.

### Notes: 
- If you're using PROGMEM, be aware of accessing the data with ___pgm_read_byte_near()___ or you'll probably crash your micro. Not using PROGMEM means the data will be in RAM.
- If you don't pad to the screen width, then the width of the line will be the nearest multiple of 8 that can enclose the image.
- Final image dimensions are included in the output file as a comment for your convenience.
- This has been tested with Adafruit's GFX DrawBitmap(), although you may need to invert your data for this to look right.
- Due to web security features, the resulting .h file with also have .txt appended - so you'll probably want to remove that.

## License
This is fully open-source under the MIT License. 
Although I'd love for you to contribute to it, make some beautiful CSS, add features, fix problems, and generally make it better; you can do whatever 
you like with it. Print it out and eat it, wear it as a hat, send it as Morse code, use it as a drum track for a synthwave jam. Just use your common sense 
and don't come crying to me if it ends in financial ruin, divorce, outbreak of war, or some other malady.

## Hosted
If you'd rather not deal with the source code yourself, the current version is hosted by GitHub and available to use online at https://instantarcade.github.io/Binarizer/
