package com.bravioniyx.marketing;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity {
    public static final String APP_URL = "https://bravioniyx-marketing-tool.vercel.app/";
    private WebView webView;
    private FrameLayout splash;
    private ImageView splashLogo;
    private View splashGlow;
    private ValueCallback<Uri[]> filePathCallback;
    private boolean splashHidden = false;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private long lastForegroundAt = 0L;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        splash = findViewById(R.id.splash);
        splashLogo = findViewById(R.id.splash_logo);
        splashGlow = findViewById(R.id.splash_glow);
        webView = findViewById(R.id.webview);
        startSplashAnimations();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        // Always prefer network so Vercel deploys show without reinstalling the APK
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        webView.setBackgroundColor(Color.parseColor("#0A0A0A"));
        webView.addJavascriptInterface(new BravioniyxBridge(), "BravioniyxNative");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams) {
                MainActivity.this.filePathCallback = filePathCallback;
                try {
                    startActivityForResult(fileChooserParams.createIntent(), 1001);
                } catch (ActivityNotFoundException e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                // keep splash until first paint finishes
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                hideSplash();
            }
        });

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(
                    String url,
                    String userAgent,
                    String contentDisposition,
                    String mimeType,
                    long contentLength) {
                try {
                    if (url.startsWith("blob:") || url.startsWith("data:")) {
                        Toast.makeText(
                                        MainActivity.this,
                                        "Use Download / Save gallery on the graphic",
                                        Toast.LENGTH_LONG)
                                .show();
                        return;
                    }
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    request.setMimeType(mimeType);
                    String name = URLUtil.guessFileName(url, contentDisposition, mimeType);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_PICTURES, "Bravioniyx/" + name);
                    request.allowScanningByMediaScanner();
                    request.setNotificationVisibility(
                            DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    dm.enqueue(request);
                    Toast.makeText(MainActivity.this, "Saving to Gallery…", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Download failed — tap Save gallery", Toast.LENGTH_LONG)
                            .show();
                }
            }
        });

        // Fresh document from Vercel every cold start (keeps cookies/localStorage)
        webView.clearCache(true);

        if (savedInstanceState == null) {
            webView.loadUrl(APP_URL);
        } else {
            webView.restoreState(savedInstanceState);
            hideSplash();
        }

        // Safety: never leave user stuck on splash
        mainHandler.postDelayed(this::hideSplash, 8000);
    }

    @Override
    protected void onResume() {
        super.onResume();
        long now = System.currentTimeMillis();
        // If user returns after 2+ minutes, pull latest deployed site
        if (lastForegroundAt > 0 && now - lastForegroundAt > 120_000 && webView != null) {
            webView.clearCache(true);
            webView.reload();
        }
        lastForegroundAt = now;
    }

    private void startSplashAnimations() {
        if (splashLogo != null) {
            Animation intro = AnimationUtils.loadAnimation(this, R.anim.splash_logo_in);
            intro.setAnimationListener(
                    new Animation.AnimationListener() {
                        @Override
                        public void onAnimationStart(Animation animation) {}

                        @Override
                        public void onAnimationEnd(Animation animation) {
                            if (splashLogo != null && !splashHidden) {
                                splashLogo.startAnimation(
                                        AnimationUtils.loadAnimation(
                                                MainActivity.this, R.anim.splash_pulse));
                            }
                        }

                        @Override
                        public void onAnimationRepeat(Animation animation) {}
                    });
            splashLogo.startAnimation(intro);
        }
        if (splashGlow != null) {
            splashGlow.startAnimation(AnimationUtils.loadAnimation(this, R.anim.splash_glow_pulse));
        }
        View subtitle = findViewById(R.id.splash_subtitle);
        if (subtitle != null) {
            AlphaAnimation fadeIn = new AlphaAnimation(0f, 1f);
            fadeIn.setDuration(700);
            fadeIn.setStartOffset(280);
            fadeIn.setFillAfter(true);
            subtitle.startAnimation(fadeIn);
        }
    }

    private void hideSplash() {
        if (splashHidden || splash == null) return;
        splashHidden = true;
        if (webView != null) webView.setVisibility(View.VISIBLE);
        if (splashLogo != null) splashLogo.clearAnimation();
        if (splashGlow != null) splashGlow.clearAnimation();
        AlphaAnimation fade = new AlphaAnimation(1f, 0f);
        fade.setDuration(480);
        fade.setFillAfter(true);
        splash.startAnimation(fade);
        mainHandler.postDelayed(
                () -> {
                    if (splash != null) splash.setVisibility(View.GONE);
                },
                500);
    }

    private void savePngToGallery(String dataUrl, String filename) {
        io.execute(
                () -> {
                    try {
                        String pure = dataUrl;
                        int comma = dataUrl.indexOf(',');
                        if (comma >= 0) pure = dataUrl.substring(comma + 1);
                        byte[] bytes = Base64.decode(pure, Base64.DEFAULT);
                        String safeName =
                                (filename == null || filename.trim().isEmpty())
                                        ? ("bravioniyx-" + System.currentTimeMillis() + ".png")
                                        : filename.trim();
                        if (!safeName.toLowerCase().endsWith(".png")) safeName = safeName + ".png";

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            ContentValues values = new ContentValues();
                            values.put(MediaStore.Images.Media.DISPLAY_NAME, safeName);
                            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                            values.put(
                                    MediaStore.Images.Media.RELATIVE_PATH,
                                    Environment.DIRECTORY_PICTURES + "/Bravioniyx");
                            values.put(MediaStore.Images.Media.IS_PENDING, 1);
                            Uri uri =
                                    getContentResolver()
                                            .insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                            if (uri == null) throw new IllegalStateException("MediaStore insert failed");
                            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                                if (out == null) throw new IllegalStateException("No output stream");
                                out.write(bytes);
                            }
                            values.clear();
                            values.put(MediaStore.Images.Media.IS_PENDING, 0);
                            getContentResolver().update(uri, values, null, null);
                        } else {
                            File dir =
                                    new File(
                                            Environment.getExternalStoragePublicDirectory(
                                                    Environment.DIRECTORY_PICTURES),
                                            "Bravioniyx");
                            if (!dir.exists() && !dir.mkdirs()) {
                                throw new IllegalStateException("Could not create Pictures/Bravioniyx");
                            }
                            File file = new File(dir, safeName);
                            try (FileOutputStream out = new FileOutputStream(file)) {
                                out.write(bytes);
                            }
                            Intent scan = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
                            scan.setData(Uri.fromFile(file));
                            sendBroadcast(scan);
                        }

                        mainHandler.post(
                                () ->
                                        Toast.makeText(
                                                        MainActivity.this,
                                                        "Saved to Gallery → Pictures/Bravioniyx",
                                                        Toast.LENGTH_LONG)
                                                .show());
                    } catch (Exception e) {
                        mainHandler.post(
                                () ->
                                        Toast.makeText(
                                                        MainActivity.this,
                                                        "Gallery save failed — try Share",
                                                        Toast.LENGTH_LONG)
                                                .show());
                    }
                });
    }

    public class BravioniyxBridge {
        @JavascriptInterface
        public void saveImage(String dataUrl, String filename) {
            if (dataUrl == null || dataUrl.isEmpty()) {
                mainHandler.post(
                        () ->
                                Toast.makeText(MainActivity.this, "Nothing to save", Toast.LENGTH_SHORT)
                                        .show());
                return;
            }
            savePngToGallery(dataUrl, filename);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 1001 && filePathCallback != null) {
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) results = new Uri[] {Uri.parse(dataString)};
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        io.shutdownNow();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
