console.log('yo');
const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
let net;

async function loadImage(url, elem) {
    return new Promise((resolve, reject) => {
        elem.onload = () => resolve(elem);
        elem.onerror = reject;
        elem.src = url;
    });
}

async function app() {
    console.log('Loading mobilenet..');

    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');

    // Create an object from Tensorflow.js data API which could capture image 
    // from the web camera as Tensor.
    const webcam = await tf.data.webcam(webcamElement);

    var classtypeMap = {'compost': 0, 'recycling': 1, 'trash': 2};
    
    // Reads an image from disk and associates it with a specific class
    // index.
    for (var classtype in IMAGES) {
        var imgNames = IMAGES[classtype];
        var classID = classtypeMap[classtype];
        
        for (var idx=0; idx<imgNames.length; idx++) {
            var imgElem = new Image();
            await loadImage(imgNames[idx], imgElem);
            //document.getElementsByTagName('body')[0].appendChild(imgElem);
            var img = tf.browser.fromPixels(imgElem);
            const activation = net.infer(img, 'conv_preds');

            // Pass the intermediate activation to the classifier.
            classifier.addExample(activation, classID);

            // Dispose the tensor to release the memory.
            img.dispose();
        }
    }

    // When clicking a button, add an example for that class.
    // document.getElementById('class-a').addEventListener('click', () => addExample(0));
    // document.getElementById('class-b').addEventListener('click', () => addExample(1));
    // document.getElementById('class-c').addEventListener('click', () => addExample(2));

    while (true) {
        if (classifier.getNumClasses() > 0) {
            const img = await webcam.capture();

            // Get the activation from mobilenet from the webcam.
            const activation = net.infer(img, 'conv_preds');
            // Get the most likely class and confidences from the classifier module.
            const result = await classifier.predictClass(activation);
            const classes = ['Compost', 'Recycling', 'Trash'];
            document.getElementById('console').innerText = `
        prediction: ${classes[result.label]}\n
        probability: ${result.confidences[result.label]}
      `;

            // Dispose the tensor to release the memory.
            img.dispose();
        }

        await tf.nextFrame();
    }


    
  // Create an object from Tensorflow.js data API which could capture image 
  // from the web camera as Tensor.
  // const webcam = await tf.data.webcam(webcamElement);
  // while (true) {
  //     const img = await webcam.capture();
  //     const result = await net.classify(img);

  //     document.getElementById('console').innerText = `
  //       prediction: ${result[0].className}\n
  //       probability: ${result[0].probability}
  //     `;

  //     // Dispose the tensor to release the memory.
  //     img.dispose();

  //     // Give some breathing room by waiting for the next animation frame to
  //     // fire.
  //     await tf.nextFrame();
  // }
    
  // Make a prediction through the model on our image.
  // const imgEl = document.getElementById('img');
  // const result = await net.classify(imgEl);
  // console.log(result);
}

app();
