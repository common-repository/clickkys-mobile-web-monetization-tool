<?php echo $this->topNavigation('my-placement'); ?>
<div class="row content col s12">
    <h1>
        <?php if (isset($data['original_id'])): ?>
            <?php echo $data['name']; ?><span><?php _e('Edit', 'clickky'); ?></span>
        <?php else: ?>
            <?php _e('Add', 'clickky'); ?>
        <?php endif; ?>

    </h1>

    <div class="row" id="edit_page">
        <div class="tab-menu">
            <ul class="tabs col s4">
                <li class="tab col s6">
                    <a class="active" href="#test1">
                        <?php _e('Settings', 'clickky'); ?>
                    </a>
                </li>
                <li class="tab col s6">
                    <a href="#test2"><?php _e('Pages to show', 'clickky'); ?>
                    </a>
                </li>
            </ul>
        </div>
        <form method="post" name="cleanup_options">
            <div id="test1" class="col s12 content_tab">
                <input type="hidden" name="settings[ads]" value="<?php echo $data['id']; ?>">
                <input type="hidden" name="name" value="<?php echo $data['name']; ?>">
                <input type="hidden" name="settings[js_file]" value="<?php echo $data['js_file']; ?>">
                <div class="tab-pane col s12 active" id="settings">
                    <div class="col s8 row" method="post" name="cleanup_options">

                        <p class="first">
                            <input type="checkbox" id="banner_status" value="1"
                                   name="data[active]" class="filled-in"
                                   value="1" <?php if ($data['status'] == 1) echo 'checked'; ?>
                            />
                            <label for="banner_status"><?php _e('Active', 'clickky'); ?></label>
                        </p>

                        <?php
                        foreach ($data['default'] as $k => $value) {
                            echo $this->createField($k, $value, $data);
                        }
                        ?>

                        <div class="form-group">
                            <button type="submit"
                                    class="btn"><?php _e('Save', 'clickky'); ?></button>
                        </div>
                    </div>
                    <div class="col s4 template-images">
                        <?php if ($data['id'] == 'fullScreen') {

                            ?>
                            <img
                                src="<?php echo CLICKKY_PLUGIN_URL . '/admin/img/ads/full.jpg'; ?>"
                                class="img-responsive banner-template-change" alt="">
                            <?php
                        } elseif (isset($data['default']['template'])) { ?>

                            <?php foreach ($data['default']['template']['values'] as $k => $img) {
                                if ($data['result']['template'] == $k) {
                                    if ($img != '') {
                                        ?>
                                        <img
                                            src="<?php echo $img; ?>"
                                            class="img-responsive banner-template-change" alt="">
                                    <?php }
                                }
                            } ?>
                        <?php } ?>
                    </div>
                </div>

            </div>
            <div id="test2" class="col s12 content_tab">
                <dv class="col s12">
                    <div class="accordion col s12">
                        <?php if ($data['id'] == 'recommended') { ?>
                            <ul class="collapsible" data-collapsible="accordion">
                                <li>
                                    <div class="collapsible-header active">
                                        <span><?php echo _e('Shortcode', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i>
                                    </div>
                                    <div class="collapsible-body">
                                        <input type="text" class="form-control"
                                               value='[clickky_recommended_apps id="<?php echo $data['original_id']; ?>"]'
                                               id="copy-input">
                                    </div>
                                </li>
                                <li>
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select page', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i>
                                    </div>
                                    <div class="collapsible-body">

                                        <p>
                                            <select class="browser-default"
                                                    name="settings[page]">
                                                <option
                                                    value=""><?php _e('Select', 'clickky'); ?></option>

                                                <option <?php if ($settings[page] == 'before_comment') echo 'selected'; ?>
                                                    value="before_comment">
                                                    <?php _e('Before comment', 'clickky'); ?>
                                                </option>
                                                <option <?php if ($settings[page] == 'after_comment') echo 'selected'; ?>
                                                    value="after_comment">
                                                    <?php _e('After comment', 'clickky'); ?>
                                                </option>
                                                <option <?php if ($settings[page] == 'before_content') echo 'selected'; ?>
                                                    value="before_content">
                                                    <?php _e('Before content', 'clickky'); ?>
                                                </option>
                                                <option <?php if ($settings[page] == 'after_content') echo 'selected'; ?>
                                                    value="after_content">
                                                    <?php _e('After content', 'clickky'); ?>
                                                </option>
                                            </select>

                                        </p>


                                    </div>
                                </li>
                                <li>
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select post', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i>
                                    </div>
                                    <div class="collapsible-body">
                                        <p>
                                            <select class="browser-default"
                                                    name="settings[post]">
                                                <option
                                                    value=""><?php _e('Select', 'clickky'); ?></option>

                                                <option <?php if ($settings[post] == 'after_comment') echo 'selected'; ?>
                                                    value="after_comment"><?php _e('After comment', 'clickky'); ?>
                                                </option>
                                                <option <?php if ($settings[post] == 'before_content') echo 'selected'; ?>
                                                    value="before_content"><?php _e('Before content', 'clickky'); ?>
                                                </option>
                                                <option <?php if ($settings[post] == 'after_content') echo 'selected'; ?>
                                                    value="after_content"><?php _e('After content', 'clickky'); ?>
                                                </option>
                                            </select>
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select category', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i>
                                    </div>
                                    <div class="collapsible-body">
                                        <p>
                                            <select class="browser-default"
                                                    name="settings[category]">
                                                <option
                                                    value=""><?php _e('Select', 'clickky'); ?></option>
                                                <option <?php if ($settings[category] == 'before_loop') echo 'selected'; ?>
                                                    value="before_loop">
                                                    <?php echo _e('Before articles', 'clickky'); ?>
                                                </option>
                                                <option <?php if ($settings[category] == 'after_loop') echo 'selected'; ?>
                                                    value="after_loop">
                                                    <?php echo _e('After articles', 'clickky'); ?>
                                                </option>
                                            </select>
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select widget', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i>
                                    </div>
                                    <div class="collapsible-body">
                                        <p>
                                            <select class="browser-default"
                                                    name="settings[widget]">
                                                <option <?php
                                                if (isset($settings['widget']))
                                                    if ($settings['widget'] == 0)
                                                        echo 'selected'; ?>
                                                    value="0"><?php _e('No', 'clickky'); ?>
                                                </option>
                                                <option <?php
                                                if (isset($settings['widget']))
                                                    if ($settings['widget'] == 1)
                                                        echo 'selected'; ?>
                                                    value="1"><?php _e('Yes', 'clickky'); ?>
                                                </option>
                                            </select>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        <?php } else { ?>
                            <p class="first">
                                <input type="checkbox" id="global" value="1"
                                       name="settings[global]" class="filled-in"
                                       value="1" <?php if ($settings['global'] == 1 || $_GET['id'] == 0) echo 'checked'; ?>
                                />
                                <label for="global"><?php _e('Use global settings', 'clickky'); ?></label>
                            </p>
                            <p>
                                <input type="checkbox" id="main"
                                       name="settings[main]"
                                       class="filled-in"
                                       value="1" <?php
                                if ($_GET['id'] == 0 && get_option($this->plugin_name . '_main') == 1)
                                    echo 'checked';
                                elseif ($settings['main'] == 1)
                                    echo 'checked';
                                ?> />
                                <label for="main"><?php _e('Сheck all pages', 'clickky'); ?></label>
                            </p>
                            <ul class="collapsible" data-collapsible="accordion">
                                <li>
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i>
                                    </div>
                                    <div class="collapsible-body">
                                        <p>

                                            <input type="checkbox" id="home"
                                                   name="settings[home]"
                                                   class="filled-in"
                                                   value="1" <?php
                                            if ($_GET['id'] == 0 && get_option($this->plugin_name . '_home') == 1)
                                                echo 'checked';
                                            elseif ($settings['home'] == 1)
                                                echo 'checked';
                                            ?>
                                            />
                                            <label for="home"><?php _e('Home', 'clickky'); ?></label>

                                        </p>
                                    </div>
                                </li>
                                <li id="pages_all">
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select page', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i></div>
                                    <div class="collapsible-body">
                                        <?php
                                        $checked_global_pages = unserialize(get_option($this->plugin_name . '_page'));
                                        if (!is_array($checked_global_pages)) {
                                            $checked_global_pages = array();
                                        }

                                        $checked_pages = $settings['page'];
                                        if (!is_array($checked_pages)) {
                                            $checked_pages = array();
                                        }
                                        $pages = get_pages();
                                        ?>
                                        <p>
                                            <input id="page_all" type="checkbox" class="filled-in"
                                                   onClick="toggleCheckbox(this, 'pages_all')"
                                                <?php

                                                if ($_GET['id'] == 0 && count($checked_global_pages) == count($pages)) {
                                                    echo 'checked';
                                                } elseif (count($checked_pages) == count($pages)) {
                                                    echo 'checked';
                                                }

                                                ?>
                                            />
                                            <label for="page_all"><?php _e('All', 'clickky'); ?></label>
                                        </p>
                                        <?php
                                        if (count($pages) > 0) {
                                            foreach ($pages as $page) {
                                                ?>
                                                <p>
                                                    <input type="checkbox" class="filled-in"
                                                           name="settings[page][]"
                                                           value="<?php echo $page->ID; ?>"
                                                           id="page_<?php echo $page->ID; ?>"
                                                        <?php
                                                        if ($_GET['id'] == 0 && is_array($checked_global_pages) && count($checked_global_pages) > 0) {
                                                            if (in_array($page->ID, $checked_global_pages))
                                                                echo 'checked';
                                                        } elseif (is_array($checked_pages) && count($checked_pages) > 0) {
                                                            if (in_array($page->ID, $checked_pages))
                                                                echo 'checked';
                                                        }
                                                        ?>
                                                    >
                                                    <label
                                                        for="page_<?php echo $page->ID; ?>"><?php echo $page->post_title; ?></label>
                                                </p>
                                                <?php
                                            }
                                        }
                                        ?>
                                    </div>
                                </li>
                                <li id="all_posts">
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select post', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i></div>
                                    <div class="collapsible-body">
                                        <?php
                                        $checked_posts = $settings['post'];
                                        if (!is_array($checked_posts)) {
                                            $checked_posts = array();
                                        }

                                        $checked_global_posts = unserialize(get_option($this->plugin_name . '_post'));
                                        if (!is_array($checked_global_posts)) {
                                            $checked_global_posts = array();
                                        }

                                        $posts = get_posts();

                                        ?>
                                        <p>
                                            <input id="post_all" type="checkbox" class="filled-in"
                                                   onClick="toggleCheckbox(this, 'all_posts')"
                                                <?php
                                                if ($_GET['id'] == 0 && count($checked_global_posts) == count($posts)) {
                                                    echo 'checked';
                                                } elseif (count($checked_posts) == count($posts)) {
                                                    echo 'checked';
                                                }
                                                ?>
                                            />
                                            <label for="post_all"><?php _e('All', 'clickky'); ?></label>
                                        </p>
                                        <?php

                                        if (count($posts) > 0) {
                                            foreach ($posts as $post) {
                                                ?>
                                                <p>
                                                    <input type="checkbox" class="filled-in"
                                                           name="settings[post][]"
                                                           value="<?php echo $post->ID; ?>"
                                                           id="post_<?php echo $post->ID; ?>"
                                                        <?php
                                                        if ($_GET['id'] == 0 && is_array($checked_global_posts) && count($checked_global_posts) > 0) {
                                                            if (in_array($post->ID, $checked_global_posts))
                                                                echo 'checked';
                                                        } elseif (is_array($checked_posts) && count($checked_posts) > 0)
                                                            if (in_array($post->ID, $checked_posts))
                                                                echo 'checked';
                                                        ?>
                                                    >

                                                    <label
                                                        for="post_<?php echo $post->ID; ?>"><?php echo $post->post_title; ?></label>
                                                </p>

                                                <?php
                                            }
                                        }
                                        ?>

                                    </div>
                                </li>
                                <li id="all_categories">
                                    <div class="collapsible-header">
                                        <span><?php echo _e('Select category', 'clickky'); ?></span>
                                        <i class="material-icons">arrow_drop_down</i></div>
                                    <div class="collapsible-body">
                                        <?php
                                        $checked_categories = $settings['category'];
                                        if (!is_array($checked_categories)) {
                                            $checked_categories = array();
                                        }
                                        $checked_global_categories = unserialize(get_option($this->plugin_name . '_category'));
                                        if (!is_array($checked_global_categories)) {
                                            $checked_global_categories = array();
                                        }


                                        $categories = get_categories();
                                        ?>
                                        <p>
                                            <input id="category__all" type="checkbox" class="filled-in"
                                                   onClick="toggleCheckbox(this, 'all_categories')"
                                                <?php
                                                if ($_GET['id'] == 0 && count($checked_global_categories) == count($categories)) {
                                                    echo 'checked';
                                                } elseif (count($checked_categories) == count($categories)) {
                                                    echo 'checked';
                                                }
                                                ?>
                                            />
                                            <label for="category__all"><?php _e('All', 'clickky'); ?></label>
                                        </p>
                                        <?php
                                        if (count($categories) > 0) {
                                            foreach ($categories as $category) {
                                                ?>
                                                <p>
                                                    <input type="checkbox" class="filled-in"
                                                           name="settings[category][]"
                                                           value="<?php echo $category->term_id; ?>"
                                                           id="category_<?php echo $category->term_id; ?>"
                                                        <?php
                                                        if ($_GET['id'] == 0 && is_array($checked_global_categories) && count($checked_global_categories) > 0) {
                                                            if (in_array($category->term_id, $checked_global_categories))
                                                                echo 'checked';
                                                        } elseif (is_array($checked_categories) && count($checked_categories) > 0)
                                                            if (in_array($category->term_id, $checked_categories))
                                                                echo 'checked';
                                                        ?>
                                                    >
                                                    <label
                                                        for="category_<?php echo $category->term_id; ?>"><?php echo $category->name; ?></label>
                                                </p>
                                                <?php
                                            }
                                        }
                                        ?>

                                    </div>
                                </li>
                            </ul>
                        <?php } ?>
                        <div class="row">
                            <button type="submit"
                                    class="btn"><?php _e('Save', 'clickky'); ?></button>
                        </div>
                    </div>
                </dv>
            </div>
        </form>
    </div>

</div>

