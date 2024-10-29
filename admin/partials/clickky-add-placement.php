<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">


<?php echo $this->topNavigation(); ?>
<div class="row content col s12">
    <h1><?php _e('Hi, you can monetize your site with Clickky!', 'clickky'); ?></h1>
    <div class="sub-title">
        <?php _e("Paste the code into the form below and that`s all.<br />
        If you don't have the code, you can sign up to <a href='https://clickky.biz/content/web-mobile-monetization' target='_blank'>Clickky`s publisher platform</a> and get code!", 'clickky'); ?>
    </div>

    <form class="input-code" method="post" action="admin.php?page=my_placement&id=0">
        <div class="row">
            <div class="input-field">
                <textarea id="code"></textarea>
                <textarea name="code" id="hide_code" style="display: none;"></textarea>
            </div>
        </div>
        <div class="row replace">
            <button class="btn right add_button" type="submit"><?php _e('CHECK', 'clickky'); ?></button>
        </div>
    </form>

</div>

