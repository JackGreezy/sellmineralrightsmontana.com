function setVideoSourceFormat() {
    // En iPhone los videos no se reproducen automáticamente si tienen el atributo src, por lo que hay que convertirlos a source
    // y establecer el atributo playsinline para forzar la reproducción automática.

    // Localiza su hay videos con el atributo src, y si no lo hay, los convierte en video con source
    const videos = document.querySelectorAll('video[src]');
    videos.forEach(video => {
        const videoSrc = video.getAttribute('src');
        const source = document.createElement('source');
        source.src = videoSrc;

        // establece el tipo de video según la extensión del archivo
        if (videoSrc.endsWith('.webm')) {
            source.type = 'video/webm';
        } else if (videoSrc.endsWith('.ogg')) {
            source.type = 'video/ogg';
        } else {
            source.type = 'video/mp4'; // Por defecto, si no es webm ni ogg
        }

        video.appendChild(source);
        video.removeAttribute('src'); // Elimina el atributo src del video

        // si tiene el atributo autoplay, lo establece
        if (video.hasAttribute('autoplay')) {
            video.setAttribute('playsinline', ''); // force autoplay on iphone
            video.muted = true;
            video.play();
        }
    });
}

setVideoSourceFormat();