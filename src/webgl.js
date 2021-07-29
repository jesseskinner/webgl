const img = new Image();
img.src = './src/backyard.jpg';
img.onload = () => {
	const canvas = document.querySelector('canvas');
	canvas.width = img.width;
	canvas.height = img.height;

	// if (Math.random() < 0.5) {
	renderImageToCanvas(canvas, img);
	// } else {
	// canvas.getContext('2d').drawImage(img, 0, 0);
	// }
};

function renderImageToCanvas(canvas, img) {
	const gl = canvas.getContext('webgl');

	const program = addProgram(gl);

	setAttribute(
		gl,
		program,
		'points',
		[
			// first triangle
			// top left
			-1, -1,

			// top right
			1, -1,

			// bottom left
			-1, 1,

			// second triangle
			// bottom right
			1, 1,

			// top right
			1, -1,

			// bottom left
			-1, 1,
		]
	);

	setAttribute(
		gl,
		program,
		'texture_coordinate',
		[
			// first triangle
			// top left
			0, 1,

			// top right
			1, 1,

			// bottom left
			0, 0,

			// second triangle
			// bottom right
			1, 0,

			// top right
			1, 1,

			// bottom left
			0, 0,
		]
	);

	addImageTexture(gl, img, program);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function addProgram(gl) {
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(
		vertexShader,
		`
            attribute vec2 points;
            attribute vec2 texture_coordinate;

            varying highp vec2 v_texture_coordinate;
        
            void main(void) {
                gl_Position = vec4(points, 0.0, 1.0);
                v_texture_coordinate = texture_coordinate;
            }
        `
	);
	gl.compileShader(vertexShader);

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(
		fragmentShader,
		`
            varying highp vec2 v_texture_coordinate;
            uniform sampler2D sampler;

            void main() {
                gl_FragColor = texture2D(sampler, v_texture_coordinate);
            }
        `
	);
	gl.compileShader(fragmentShader);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	gl.useProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Program not linked: ', gl.getProgramInfoLog(program));
	}

	return program;
}

function addImageTexture(gl, img, program) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(gl.getUniformLocation(program, 'sampler'), 0);
}

function setAttribute(gl, program, attribute, data) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	const location = gl.getAttribLocation(program, attribute);
	gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(location);
}
