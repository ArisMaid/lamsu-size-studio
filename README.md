# LAMSU · 尺寸表工作台

参考黑白服装尺寸表制作的网页工具，无需安装依赖，也无需 API 密钥。

## 使用

1. 填写款号，设置尺码范围（按从小到大排列）。
2. 在“基准码与递增”选一个基准尺码，填写各部位尺寸和各自的每码增量。增量为 0 时所有自动值保持一致。
3. 在“尺寸数据”直接改单格，修改后呈紫色，手动值不会因规则变化被覆盖，基准码所在行也可以单独修正。
4. 点击单格旁的恢复按钮，让这一格重新跟随规则；“恢复全部自动”需要确认。
5. 可在“选码与说明”编辑或隐藏选码参考、洗护说明及提示文字。
6. 点击“导出图片”生成 1080 px 宽的 PNG；“打印 / PDF”打开浏览器打印界面。

公式：自动尺寸 = 上方填写的基准尺寸 +（当前尺码序号 − 基准尺码序号）× 该维度递增值。

切换基准码时，以所选尺码当前显示的尺寸作为新基准，所选行的手动值转为基准尺寸，其余手动值保留。选码体重参考由用户自行填写，不根据服装尺寸自动推测。

页面刷新后会恢复默认数据。当前版本在浏览器中处理数据，不保存款式档案；导出图片后可自行留存。无需账号、数据库或 API 密钥。

## 默认尺寸

单位为 cm，基准码为 S。各维度增量可以单独设置，表格中每一格也可以单独修改。

| 尺码 | 腰围 | 臀围 | 腿围 | 脚围 | 裤长 |
| --- | --- | --- | --- | --- | --- |
| S | 64 | 94 | 60 | 51 | 103 |
| M | 67 | 97 | 61.5 | 52 | 104 |
| L | 70 | 100 | 63 | 53 | 105 |
| XL | 73 | 103 | 64.5 | 54 | 106 |
| 2XL | 76 | 106 | 66 | 55 | 107 |

选码参考从 S 的 85–95 斤到 2XL 的 125–135 斤，身高参考为 160–170 cm。可在 `dist/app.js` 的 `example` 对象中修改默认值。

## NAS 部署（直接拉取镜像）

镜像：`ghcr.io/arismaid/lamsu-size-studio:latest`，支持 `linux/amd64` 和 `linux/arm64`。

在 NAS 的 Container Manager、Docker 管理工具中导入本仓库的 `compose.yaml`，或通过 SSH 执行：

```sh
git clone https://github.com/ArisMaid/lamsu-size-studio.git
cd lamsu-size-studio
docker compose pull
docker compose up -d
```

浏览器访问 `http://NAS的局域网IP:8080`。无需在 NAS 或个人电脑上编译。

若 8080 端口已被占用，可修改 Compose 左侧端口，或者在 `compose.yaml` 同目录的 `.env` 文件中填写 `LAMSU_PORT=8088`，再启动。容器内部端口固定为 8080。

更新到最新镜像：

```sh
docker compose pull
docker compose up -d
```

镜像以非 root 用户运行，Compose 为只读文件系统，仅 `/tmp` 使用内存临时目录。页面在浏览器内计算和导出，不需要挂载数据目录。它没有登录功能，适合局域网使用。

## GitHub 自动构建

`.github/workflows/docker.yml` 在推送 `main`、推送 `v*` 标签或手动运行时触发：

1. 检查 JavaScript 语法并运行尺寸模型测试。
2. 在 GitHub 的机器上构建并实际启动容器，验证页面和所有静态资源。
3. 构建 amd64 / arm64 镜像，使用 GitHub 自带的 `GITHUB_TOKEN` 发布到 GHCR，无需设置额外密码。

`main` 发布 `latest` 与 `sha-完整提交号`；例如 `v1.0.0` 标签发布 `1.0.0` 与提交号标签。可以把 Compose 中的镜像标签改为固定版本或提交号，避免更新到其他版本。

如果 fork 到其他账号，工作流自动使用新仓库名，需同步修改 Compose 镜像地址和 Dockerfile 的源码链接。首次发布的 GHCR 包可能默认私有，需要在包的设置中选择 Public，才能匿名拉取。

## 本地运行

直接打开 `dist/index.html`，或在此目录执行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

然后打开 `http://127.0.0.1:4173/`。

## 验证

```sh
node --test tests/model.test.cjs
```

自动规则、单格保护（包括基准码）、小数和零增量、基准切换、尺码增删及无效输入均有验证。

## 技术与许可

纯 HTML / CSS / JavaScript，Docker 使用官方 Nginx Alpine 镜像。代码按 MIT License 开源，见 `LICENSE`。

构建配置参考 [Docker 多架构构建文档](https://docs.docker.com/build/ci/github-actions/multi-platform/) 和 [GitHub Container Registry 文档](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)。
