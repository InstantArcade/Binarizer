// file variable
let finput;

// image vars
let img;
let imgout;
let bwImg, thimg;
let dstImg;

// Buttons
let ditherButton;
let monoSaveButton;
let ditheredSaveButton;

// slider
let slide_thresh;

// checkboxes
let autoDither;
let alphaWhite;
let invert;
let pad;
let progmem;

// text input
let nameInput;

let threshold = 127;

// layout vars
let imgYStart = 40;
let imgXSpacing = 500;
let imgYSpacing = 300;
let fieldYSpacing = 25;

function imageLoaded()
{
    // For Sharp Memory Display, constrain image to 400x240
    while( (img.width > 400) || (img.height > 240) )
    {
      if( img.width > 400 )
      {
        img.resize(400,0);
      }
      else
      {  
        img.resize(0,240);
      }
    }
    // make destination image the same size
    dstImg = createImage(img.width, img.height);
    bwImg = createImage(img.width, img.height);
//    bwimg.copy(img);
    img.filter(GRAY);
    dither();
}

function imageLoadFailed()
{
  // todo
}

function handleFile(file) 
{
  img = null;
  dstImg = null;
  // print(file);
  if (file.type === 'image') 
  { 
    // image loading is asynchronous
    img = loadImage(file.data, imageLoaded, imageLoadFailed);
    nameInput.value(file.name.split('.')[0]);
  } 
}

function dither()
{
  if( !img ) return;
  
  if( img && bwImg )
  {
    bwImg.copy(img,0,0,img.width,img.height,0,0,bwImg.width,bwImg.height) 
    bwImg.filter(THRESHOLD, threshold/255.0);
  }
  // use floyd-steinberg dither alg
  if( img !== null && dstImg !== null )
  {
    // copy all source pixels to destination first
    dstImg.copy(img,0,0,img.width,img.height,0,0,bwImg.width,bwImg.height) 
    if( invert.checked() )
    {
      dstImg.filter(INVERT);
      bwImg.filter(INVERT);
    }
    img.loadPixels();
    dstImg.loadPixels();

    let lo = dstImg.width*4;
    for( let y = 0; y < dstImg.height-1; y++ )
    {
      for( let x = 0; x < dstImg.width-1; x++ )
      {
        let offset = (y*dstImg.width+x)*4;
        
        let sR = dstImg.pixels[offset+0];
        let sG = dstImg.pixels[offset+1];
        let sB = dstImg.pixels[offset+2];
        
        // Find closest color - in our case, threshold this color
        let slum = (sR+sG+sB)/3.0;
        let dlum = (slum > threshold)?255:0;
        
        if( img.pixels[offset+3] < 255 ) // we have alpha
        {
          if( alphaWhite.checked() )
            {
              dstImg.pixels[offset+0] = 255;
              dstImg.pixels[offset+1] = 255;
              dstImg.pixels[offset+2] = 255;
              dstImg.pixels[offset+3] = 255;
            }
            else  
            {
              dstImg.pixels[offset+0] = 0;
              dstImg.pixels[offset+1] = 0;
              dstImg.pixels[offset+2] = 0;
              dstImg.pixels[offset+3] = 255;
            }
        }
        else
        {
          dstImg.pixels[offset+0] = dlum;
          dstImg.pixels[offset+1] = dlum;
          dstImg.pixels[offset+2] = dlum;
          dstImg.pixels[offset+3] = 255;
        }
        
        //(alphaWhite.checked() && img.pixels[offset+3]<255)?0:255; // maintain the source alpha

        let quantErr = slum-dlum;
        
        // x+1,y
        dstImg.pixels[offset+0+4] += quantErr * 7/16.0;
        dstImg.pixels[offset+1+4] += quantErr * 7/16.0;
        dstImg.pixels[offset+2+4] += quantErr * 7/16.0;
        
        if( x > 0 )
        {
          // x-1, y+1
          dstImg.pixels[offset+0-4+lo] += quantErr * 3/16.0;
          dstImg.pixels[offset+1-4+lo] += quantErr * 3/16.0;
          dstImg.pixels[offset+2-4+lo] += quantErr * 3/16.0;
        }
        
        // x, y+1
        dstImg.pixels[offset+0+lo] += quantErr * 5/16.0;
        dstImg.pixels[offset+1+lo] += quantErr * 5/16.0;
        dstImg.pixels[offset+2+lo] += quantErr * 5/16.0;

        // x+1, y+1
        dstImg.pixels[offset+0+4+lo] -= quantErr * 1/16.0;
        dstImg.pixels[offset+1+4+lo] -= quantErr * 1/16.0;
        dstImg.pixels[offset+2+4+lo] -= quantErr * 1/16.0;

      }
    }

    dstImg.updatePixels();
  }
}

function setup() 
{
  createCanvas(1200, 800);
  finput = createFileInput(handleFile);
  finput.position(0, 0);

  ditherButton = createButton('dither');
  ditherButton.position(imgXSpacing, fieldYSpacing*7);
  ditherButton.mousePressed(dither);
  
  monoSaveButton = createButton('Save');
  monoSaveButton.position(0, 0);
  monoSaveButton.mousePressed(saveMono);
  monoSaveButton.style('visibility: hidden');

  ditheredSaveButton = createButton('Save');
  ditheredSaveButton.position(0, 0);
  ditheredSaveButton.mousePressed(saveDithered);
  ditheredSaveButton.style('visibility: hidden');
  
  slide_thresh = createSlider(0,255,128);
  slide_thresh.position(imgXSpacing+97,fieldYSpacing+5);
  slide_thresh.style('width: 260px');
  
  autoDither = createCheckbox("Autoupdate threshold/dither", true);
  autoDither.position(imgXSpacing,fieldYSpacing*2 );

  alphaWhite = createCheckbox("Alpha to White", true);
  alphaWhite.position(imgXSpacing,fieldYSpacing*3 );
  alphaWhite.changed(dither)

  pad = createCheckbox("Pad to 400px Wide", true);
  pad.position(imgXSpacing,fieldYSpacing*4 );

  invert = createCheckbox("Invert", false);
  invert.position(imgXSpacing,fieldYSpacing*5);
  invert.changed(dither);
  
  nameInput = createInput('<data output name>');
  nameInput.style('width: 250px');
  nameInput.position(imgXSpacing+100,5);
  
  progmem = createCheckbox('PROGMEM prefix', true);
  progmem.position(imgXSpacing, fieldYSpacing*6);
}

function saveCode( sourceImg )
{
  sourceImg.loadPixels();
  let curByte=0;
  let bytesThisLine = 0;
  let bitCount=0;
  let bval=0;
  let runWidth = 400;
  let strOut = "byte "+ nameInput.value() + (progmem.checked() ? " PROGMEM ":"") +"[] = { ";
  
  if( !pad.checked() )
  {
    // only pad to image width (but multiple of 8) instead of 400
    runWidth = (sourceImg.width+7) & ~7;
  }
  
  for( let y=0; y < sourceImg.height; y++ )
  {
    for( let x=0; x < runWidth; x++ )
    {
      if( x < sourceImg.width ) // image might not be 400px wide, so take care getting source data
      {
        bval = sourceImg.pixels[(y*sourceImg.width+x)*4];
      }
      else // need to fill in here
      {
        if(invert.checked())
        {
          bval = 1;
        }
        else
        {
          bval = 0;
        }
      }
      curByte <<= 1;
      curByte |= bval > 0 ? 1:0;
      bitCount++;
      
      if( bitCount > 7)
      {
        // complete byte
        bitCount = 0;
        let hexStr = curByte.toString(16);
        if( hexStr.length<2 ) hexStr = "0"+hexStr;
        strOut += "0x" + hexStr + ", ";
        curByte = 0;
        
        bytesThisLine++;
        if( bytesThisLine > 9 && x < runWidth )
        {
          bytesThisLine = 0;
          strOut += "\n\t";    
        }
      }
    }
    // strOut += "\n\t";    
  }
  strOut += "};\n";
  
  // console.log( strOut );
  
  save([strOut], nameInput.value() + ".h");
}

function saveMono()
{
  saveCode(bwImg);
}

function saveDithered()
{
  saveCode(dstImg);
}

let lastThresh = 99999;

function draw() 
{
  if( img )
  {
    clear();
    threshold = slide_thresh.value();
    if( threshold != lastThresh && autoDither.checked() )
    {
      dither();
      lastThresh = threshold;
    }
    image(img, 0,imgYStart);
    if( dstImg )
    {
      image(dstImg, 0, imgYStart+imgYSpacing);
      ditheredSaveButton.position(0, imgYStart+imgYSpacing+dstImg.height);
      ditheredSaveButton.style('visibility: visible');
    }
    if( bwImg )
    {
      image(bwImg,imgXSpacing,imgYStart+imgYSpacing);
      monoSaveButton.position(imgXSpacing, imgYStart+imgYSpacing+bwImg.height);
      monoSaveButton.style('visibility: visible');
    }
  }
  textSize(14);
  textStyle(NORMAL);
  text("Threshold",imgXSpacing,fieldYSpacing*2-5);
  text("Data/Filename",imgXSpacing,fieldYSpacing-5);
}