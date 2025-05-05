alter table rst.recreation_map_feature_geom
drop constraint recreation_map_feature_geom_rmf_skey_fkey;

alter table rst.recreation_map_feature_geom
add constraint recreation_map_feature_geom_rmf_skey_fkey
foreign key (rmf_skey)
references rst.recreation_map_feature(rmf_skey)
on update cascade;
