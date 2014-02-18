function computeFourierTransform(spatialY) {
	var sampleCount = spatialY.length;
	var n = -2 * Math.PI / sampleCount;
	var freqImagY = freqRealY = new Array(sampleCount);
	for(var i = 0; i < sampleCount; i++) {
		freqRealY[i] = freqImagY[i] = 0;
		for(var j = 0; j < sampleCount; j++) {
			freqRealY[i] += spatialY[j] * Math.cos(n * i * j);
			freqImagY[i] += spatialY[j] * Math.sin(n * i * j);
		}
	}
    return [freqRealY, freqImagY];
}
function computeInverseFourierTransform4Array(spatialX, dft) {
	var sampleCount = spatialX.length;
	var reconstructedY = new Array(sampleCount);
	for(var i = 0; i < sampleCount; i++) {
		reconstructedY[i] = computeInverseFourierTransform(spatialX[i], dft);
	}
	
    return reconstructedY;
}
function computeInverseFourierTransform(x, dft)
{
	var freqRealY = dft[0];
    var freqImagY = dft[1];
	var sampleCount = freqRealY.length;

	var n = -2 * Math.PI / sampleCount;
	var reconstructedY = 0;
	for(var j = 0; j < sampleCount; j++) {
		reconstructedY += freqRealY[j] * Math.cos(n * x * j) / sampleCount
							+ freqImagY[j] * Math.sin(n * x * j) / sampleCount;
	}
	return reconstructedY;
}