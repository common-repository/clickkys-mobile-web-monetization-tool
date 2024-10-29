<?php echo $this->topNavigation('my-placement'); ?>

<div class="row content  my_placement col s12">
    <h1><?php _e('MY PLACEMENT', 'clickky'); ?></h1>
    <div class="row">
        <table class="ads_list">
            <tbody>
            <?php if(count($result)>0): ?>
                <?php foreach ($result as $k => $item): ?>
                    <tr>
                        <td class="name"><?php echo($k + 1); ?>. <?php echo $item['name']; ?></td>
                        <td class="status">
                            <div class="switch">
                                <label>
                                    <input type="checkbox"
                                           data-id="<?php echo $item['original_id']; ?>" <?php if ($item['status'] == 1) echo 'checked' ?>>
                                    <span class="lever"></span>
                                </label>
                            </div>

                        </td>
                        <td class="edit">
                            <a href="admin.php?page=my_placement&id=<?php echo $item['original_id']; ?>">
                                <i class="material-icons">mode_edit</i> <span><?php _e('Edit', 'clickky'); ?></span>
                            </a>
                        </td>
                        <td class="delete">
                            <a href="#" data-id="<?php echo $item['original_id']; ?>">
                                <i class="material-icons">delete</i> <span><?php _e('Delete', 'clickky'); ?></span>
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                     <td><?php _e('No placement', 'clickky'); ?></td>
                </tr>
            <?php endif; ?>
            </tbody>
        </table>

    </div>
</div>

<button data-target="modal1" id="modal_click" style="display: none;"></button>


