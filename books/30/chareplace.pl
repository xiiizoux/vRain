#!/usr/bin/perl
#by shanleiguang@gmail.com, 2025
use strict;
use warnings;

use Getopt::Std;
use Encode;
use utf8;

binmode(STDIN, ':encoding(utf8)');
binmode(STDOUT, ':encoding(utf8)');
binmode(STDERR, ':encoding(utf8)');

my %opts;

getopts('f:t:', \%opts);

my $from = $opts{'f'} ? $opts{'f'} : 1;
my $to = $opts{'t'} ? $opts{'t'} : 1;
my %rchars; #保存替换字符

open RTXT, '< replace.txt';
while(<RTXT>) {
	chomp;
	$_ = decode('utf-8', $_);
	my @tmp = split /\|/, $_;
	if($tmp[3]) {
		$rchars{$tmp[0]} = $tmp[3];
	}
}
close(RTXT);

opendir TBADIR, "text_ba";
foreach my $tfn (sort readdir(TBADIR)) {
	next if($tfn !~ m/\.txt$/i);
	my ($content, @chars);
	print "replacing 'text_ba/$tfn' ... \n";
	open TEXTBA, "< text_ba/$tfn";
	{ local $/ = undef; $content = <TEXTBA>; }
	close(TEXTBA);
	$content = decode('utf-8', $content);
	foreach my $from (keys %rchars) {
		my $to = $rchars{$from};
		$content =~ s/$from/$to/g;
	}
	open TEXT, "> text/$tfn";
	print TEXT $content;
	close(TEXT);
}
close(TBADIR);

sub get_font {
	my ($char, $fref) = @_;
	my @fonts = @$fref;
	foreach my $f (@fonts) {
		return $f if(font_check($f, $char));
	}
	return undef;
}

sub font_check {
	my ($font, $char) = @_;
	$font = "../../fonts/$font";
	my $freetype = Font::FreeType->new();
	my $face = $freetype->face($font);
	my $fontglyph = $face->glyph_from_char($char);

	return 1 if($fontglyph);
	return 0;
}
