// src/api/travelApi.js
import Taro from '@tarojs/taro';

export async function submitTravel({ title, value, images, videoFile, agreement }) {
  try {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('content', value);
    formData.append('tags', '示例标签');

    console.log("准备提交的图片列表：", images);

    images.forEach((image, index) => {
      const file = image.originFileObj;
      if (file instanceof File) {
        const fileToHttp = URL.createObjectURL(file)
        formData.append('images', fileToHttp); // 或 file，视后端要求
        console.log(`添加图片 ${index + 1}:`, file.name);
      } else {
        console.warn(`第 ${index + 1} 张图片没有 originFileObj`);
      }
    });

    if (videoFile instanceof File) {
      formData.append('video', videoFile);
      console.log('添加视频文件:', videoFile.name);
    }

    console.log('FormData内容：');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (!title.trim()) {
      Taro.showToast({ title: '标题不能为空', icon: 'none', duration: 2000 });
      return false;
    }

    if (!value.trim()) {
      Taro.showToast({ title: '内容不能为空', icon: 'none', duration: 2000 });
      return false;
    }

    if (images.length === 0) {
      Taro.showToast({ title: '请上传图片', icon: 'none', duration: 2000 });
      return false;
    }

    if (!agreement) {
      Taro.showToast({ title: '请同意发布规则', icon: 'none', duration: 2000 });
      return false;
    }

    // const response = await fetch('http://localhost:3000/passage/user', {
    const response = await fetch('http://127.0.0.1:4523/m1/6348302-6043895-default/passage/user', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      Taro.showToast({ title: '发布成功', icon: 'success', duration: 2000 });
      console.log('发布成功:', result);
      return true;
    } else {
      Taro.showToast({ title: '发布失败', icon: 'none', duration: 2000 });
      console.error('后端错误:', result);
      return false;
    }
  } catch (err) {
    Taro.showToast({ title: '网络异常', icon: 'none', duration: 2000 });
    console.error('网络异常:', err);
    return false;
  }
}
