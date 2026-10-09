FROM nginx:stable-alpine
LABEL org.opencontainers.image.title="LAMSU Size Studio" \
      org.opencontainers.image.description="服装尺寸表制作工具" \
      org.opencontainers.image.source="https://github.com/ArisMaid/lamsu-size-studio" \
      org.opencontainers.image.licenses="MIT"
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/index.html dist/styles.css dist/model.js dist/app.js /usr/share/nginx/html/
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
